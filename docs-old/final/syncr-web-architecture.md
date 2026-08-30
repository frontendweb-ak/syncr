# Syncr Web — Production Architecture

Built on top of the scaffold you already have (Next 16 App Router, `(auth)`/`(public)` route groups, `config/`, `core/fonts`, `infra/api`, `infra/query`). This fills the gaps: token handling, state, data-fetching split, theming, and the pieces still commented out in `http.ts`.

---

## 1. Dependency additions

Your `package.json` already covers the core (`@tanstack/react-query`, `axios`, `zustand`, `react-hook-form` + `zod`, `sonner`, `shadcn`, `js-cookie`). Add:

| Package | Purpose |
|---|---|
| `@tanstack/react-table` | Tables — headless, pairs with shadcn's table primitives |
| `@tanstack/react-virtual` | Virtualization for long lists (audit logs, member lists) |
| `recharts` | Charts — SSR-safe enough, good shadcn `chart.tsx` wrapper support |
| `date-fns` + `date-fns-tz` | Dates — smaller & more tree-shakeable than moment/luxon, tz support for orgs across regions |
| `cmdk` | Command palette (⌘K) — Vercel/Linear-style |
| `react-hotkeys-hook` | Keyboard shortcuts |
| `@monaco-editor/react` or `@uiw/react-codemirror` | Code editor. CodeMirror is lighter and better for a web app that isn't primarily an IDE; reach for Monaco only if you need full VS Code fidelity (IntelliSense, multi-cursor parity) |
| `react-markdown` + `remark-gfm` | Markdown rendering (READMEs, PR descriptions if you mirror GitHub content) |
| `react-dropzone` | File uploads (avatars, attachments) |
| `nuqs` | URL state (search/filter params) synced with React — avoids reinventing query-param sync for tables |
| `posthog-js` (or `@vercel/analytics`) | Product analytics |
| `@sentry/nextjs` | Error tracking — has first-class Next App Router integration (server + edge + client) |
| `pino` + `pino-pretty` | Structured logging on the server side |
| `@vercel/flags` or a hosted flag provider (LaunchDarkly/Flagsmith) | Feature flags — don't roll your own until you need to |
| `next-intl` | i18n — best App Router support if/when you internationalize |
| `vitest` + `@testing-library/react` | Unit/component tests |
| `playwright` | E2E tests, especially for the auth flows |
| `msw` | Mocking the backend in tests/storybook |

Rejected alternatives worth naming: **NextAuth/Clerk/Supabase Auth** (you already ruled these out — your backend owns identity, so a generic auth library adds an abstraction you'd fight); **Redux Toolkit** (more ceremony than this app needs — Zustand covers client state, React Query covers server state, so there's no cross-cutting need RTK solves better); **Formik** (react-hook-form is faster and has smaller re-render surface, and you're already on it); **moment.js** (unmaintained, large bundle).

---

## 2. Folder structure

Extending what's in your screenshot:

```
apps/web/src/
├── app/
│   ├── (auth)/                    # unauthenticated: login, register, reset
│   │   └── layout.tsx
│   ├── (public)/
│   │   └── page.tsx
│   ├── (app)/                     # authenticated shell — add this group
│   │   ├── layout.tsx             # requires session, renders org switcher/sidebar
│   │   ├── [orgSlug]/
│   │   │   ├── layout.tsx         # resolves org context, injects permissions
│   │   │   ├── page.tsx
│   │   │   ├── settings/
│   │   │   ├── members/
│   │   │   └── integrations/github/
│   ├── api/
│   │   └── auth/
│   │       ├── refresh/route.ts   # BFF-style proxy if you decide to set httpOnly cookies from Next
│   │       └── logout/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── ui/                        # shadcn primitives, untouched
│   └── shared/                    # cross-feature composites (org-switcher, permission-gate)
├── features/                      # one folder per domain
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts                 # feature-scoped query/mutation functions
│   │   └── schemas.ts             # zod schemas for this feature
│   ├── organizations/
│   ├── members/
│   ├── github-integration/
│   ├── api-keys/
│   └── audit-log/
├── hooks/                         # cross-cutting hooks (use-media-query, use-debounced-value)
├── providers/
│   ├── app-providers.tsx          # composes all providers below
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   └── auth-provider.tsx          # hydrates auth store, listens for cross-tab events
├── stores/
│   ├── auth-store.ts              # zustand: user, org, permissions, access token
│   └── ui-store.ts                # zustand: sidebar collapsed, command palette open
├── infra/
│   ├── api/
│   │   └── http.ts
│   ├── network/
│   │   ├── refresh-mutex.ts       # single-flight refresh
│   │   └── request-id.ts
│   └── query/
│       └── query-client.ts
├── services/                      # thin wrappers: one file per backend resource
│   ├── auth.service.ts
│   ├── org.service.ts
│   ├── members.service.ts
│   └── github.service.ts
├── lib/                           # auth-token utils, permission-check utils, cn()
├── utils/
├── types/
│   ├── api.ts                     # generated or hand-written response types
│   └── auth.ts
├── config/
│   ├── env.ts
│   └── metadata.ts
└── core/
    └── fonts/
```

`features/*` own their UI + data logic; `services/*` are the thin, typed functions that call `infra/api/http.ts`; `stores/*` hold client state that many features read. This keeps a clean dependency direction: `app/ → features/ → services/ → infra/`.

---

## 3. Authentication architecture

This is the part worth getting right first — everything else depends on it.

### 3.1 Where tokens live

- **Refresh token**: httpOnly, secure, `SameSite=Lax` cookie, **set by your Hono backend**, never touched by JS. This is non-negotiable for a token that lives for days/weeks — keeping it out of JS reach is the whole point of httpOnly.
- **Access token**: short-lived (10–15 min), kept **in memory only** (Zustand store, not persisted to localStorage/cookies). Memory-only access tokens can't be exfiltrated by XSS reading storage, and the short expiry limits the blast radius if one leaks another way. On a hard refresh, the app calls `/auth/refresh` (which relies on the httpOnly cookie) to re-mint an access token before rendering the authenticated shell.

```typescript
// stores/auth-store.ts
interface AuthState {
  accessToken: string | null;
  user: User | null;
  currentOrg: Organization | null;
  permissions: string[];
  status: "idle" | "authenticating" | "authenticated" | "unauthenticated";
  setSession: (data: { accessToken: string; user: User; org: Organization; permissions: string[] }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  currentOrg: null,
  permissions: [],
  status: "idle",
  setSession: (data) => set({ ...data, status: "authenticated" }),
  clearSession: () => set({ accessToken: null, user: null, currentOrg: null, permissions: [], status: "unauthenticated" }),
}));
```

Don't persist this store with `zustand/middleware persist` — that would put the access token back in localStorage. Only `currentOrg.id` and UI prefs (theme, sidebar state) are safe to persist.

### 3.2 Filling in `http.ts`

Your commented-out interceptor is the right shape. Two things to add: a **single-flight refresh mutex** (so 6 parallel 401s don't trigger 6 refresh calls) and **request ID propagation**.

```typescript
// infra/network/refresh-mutex.ts
let refreshPromise: Promise<string> | null = null;

export async function getRefreshedToken(refreshFn: () => Promise<string>) {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
```

```typescript
// infra/api/http.ts
import { v4 as uuid } from "uuid";
import { useAuthStore } from "@/stores/auth-store";
import { getRefreshedToken } from "@/infra/network/refresh-mutex";

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Request-Id"] = uuid();
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await getRefreshedToken(async () => {
          const { data } = await instance.post("/auth/refresh"); // cookie sent automatically
          return data.accessToken;
        });
        useAuthStore.getState().setSession({ ...useAuthStore.getState(), accessToken: newToken } as any);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        broadcastLogout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(normalizeError(error));
  }
);
```

`normalizeError` should collapse Axios/network/validation errors into one shape (`{ code, message, fieldErrors? }`) so UI code never branches on Axios internals.

### 3.3 Multi-tab sync

Use `BroadcastChannel` (simpler than storage-event polyfilling and well supported):

```typescript
const authChannel = new BroadcastChannel("syncr-auth");

export function broadcastLogout() {
  authChannel.postMessage({ type: "LOGOUT" });
}

export function broadcastLogin(session: SessionPayload) {
  authChannel.postMessage({ type: "LOGIN", session });
}

// in auth-provider.tsx
useEffect(() => {
  authChannel.onmessage = (event) => {
    if (event.data.type === "LOGOUT") useAuthStore.getState().clearSession();
    if (event.data.type === "LOGIN") useAuthStore.getState().setSession(event.data.session);
  };
}, []);
```

### 3.4 Organization switching & permissions

- `currentOrg` and `permissions` live in the same auth store, refetched whenever the org changes (`POST /organizations/:id/switch` → new access token scoped to that org, since RBAC is per-org).
- A `<PermissionGate permission="members:invite">` component reads from the store — cheap, synchronous, no extra fetch per gate.
- Route-level enforcement still happens server-side in your Hono API; the frontend gate is UX only, never the security boundary.

### 3.5 Server Components and auth

Server Components can't read the in-memory Zustand store (different runtime). For SSR'd authenticated pages, read the **access token from a short-lived cookie** that mirrors the memory token (set it alongside the in-memory value, `httpOnly: false` isn't needed if you only use it server-side — actually make it httpOnly too and read it in Route Handlers/Server Components via `cookies()`, never exposing it to client JS). This means: on login, your Next.js Route Handler (not the browser directly) talks to the Hono backend, receives both tokens, and sets **two** httpOnly cookies (access + refresh). The client-side Zustand store then gets hydrated from a `/me` call on mount, not from reading the cookie directly. This BFF-lite pattern keeps both tokens off the JS-accessible surface entirely, which is stronger than the memory-token approach in 3.1 — recommended if you're comfortable adding that thin proxy layer in `app/api/auth/*`.

---

## 4. Data fetching strategy

| Scenario | Tool |
|---|---|
| Initial page data, SEO-relevant, rarely mutated from the client | Server Component + native `fetch` with `next: { revalidate }` or `tags` |
| Authenticated dashboard data fetched on load, then kept fresh client-side | Server Component prefetch → `dehydrate` → React Query on client (hydration pattern) |
| Interactive lists/tables, filters, pagination | React Query (client) |
| Anything with optimistic UI (toggling a member role, renaming an org) | React Query `useMutation` with `onMutate` optimistic update |
| Real-time-ish data (audit log tailing, build status) | React Query with `refetchInterval`, or upgrade to SSE/WebSocket later |
| Form submissions that redirect or do a single server-side write with no client interactivity needed after | Server Action |

### Hydration pattern

```typescript
// app/(app)/[orgSlug]/members/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getMembers } from "@/services/members.service";
import { MembersTable } from "@/features/members/components/members-table";

export default async function MembersPage({ params }: { params: { orgSlug: string } }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["members", params.orgSlug],
    queryFn: () => getMembers(params.orgSlug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MembersTable orgSlug={params.orgSlug} />
    </HydrationBoundary>
  );
}
```

Server-side fetches in Server Components should call your Hono backend directly with a token read from the httpOnly cookie (via `cookies()`), not through the Axios client (that's a browser-only instance).

### Production defaults

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — data feels fresh without refetching every mount
      gcTime: 5 * 60_000,         // 5min — keep cache warm across tab switches
      retry: (failureCount, error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      networkMode: "offlineFirst",  // don't nuke cache just because the network blipped
      refetchOnWindowFocus: false,  // your current default — keep it, it's the right call for a dashboard app
      structuralSharing: true,
    },
    mutations: {
      retry: 0,                    // never silently retry a write
      networkMode: "offlineFirst",
    },
  },
});
```

Cache invalidation: key queries hierarchically (`["members", orgId]`, `["members", orgId, memberId]`) so a mutation can invalidate the whole `["members", orgId]` branch with `invalidateQueries({ queryKey: ["members", orgId] })`.

---

## 5. Providers composition

```typescript
// providers/app-providers.tsx
"use client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
```

`QueryProvider` creates the `QueryClient` with `useState` (not module-level) inside client components to avoid leaking data between requests on the server — module-level singletons are fine for pure client SPAs but unsafe here since Next.js can share modules across requests server-side.

---

## 6. Theming & branding

Your `globals.css` is a solid shadcn baseline but it's still grayscale (`oklch(x 0 0)` everywhere) — none of it reflects the purple→blue brand yet. Suggested token additions:

```css
:root {
  --brand-gradient: linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 260));
  --primary: oklch(0.52 0.24 275);           /* indigo-violet, matches the logo's blue-purple */
  --primary-foreground: oklch(0.98 0 0);
  --ring: oklch(0.52 0.24 275 / 0.5);
  --radius: 0.625rem;                        /* keep — Linear/Vercel both sit around 8–10px base */
}
```

- **Typography**: Plus Jakarta Sans (already chosen) is a good Vercel/Linear-adjacent geometric sans — keep it for UI, keep JetBrains Mono for code/tokens/IDs.
- **Radius scale**: your `@theme inline` block already derives `sm/md/lg/xl/2xl` from one `--radius` — good, don't hand-author each one.
- **Shadows**: keep them subtle and colored, not pure black — `0 1px 2px oklch(0.52 0.24 275 / 0.08)` reads as "product," flat gray shadows read as "template."
- **Motion**: `tw-animate-css` (already installed) for utility-level transitions; add `framer-motion` only if you need orchestrated/gesture animation (drag-to-reorder, page transitions) — don't add it just for hover states, Tailwind handles those.
- **Iconography**: `lucide-react` (already installed) is the right call — it's what Linear/shadcn ecosystem defaults to, keeps icon weight consistent with the geometric sans.
- **Dark mode**: `next-themes` with `attribute="class"` matches the `.dark` selector already in your CSS — no changes needed there, just wire the provider.

---

## 7. Deployment, performance, security, scalability

**Deployment**: Vercel is the path of least resistance given the stack (Edge-compatible middleware for auth redirects, ISR for any public marketing pages). Route Handlers that proxy to your Hono backend should run on Node runtime (not Edge) if they need `cookies()` with httpOnly writes and full Node crypto — check case by case.

**Performance**: prefetch on hover for primary nav (`router.prefetch`), use `next/dynamic` for the code editor and Monaco/CodeMirror bundle (large, rarely needed above the fold), virtualize any list over ~50 rows with `@tanstack/react-virtual`, and keep Server Components as the default — only mark `"use client"` at the leaf where interactivity is actually needed.

**Security**: httpOnly+secure+SameSite cookies for both tokens (see §3.5), CSRF isn't needed for the Bearer-token API calls but *is* needed for any cookie-authenticated Route Handler mutation (double-submit token or Hono-side origin checks), strict CSP disallowing inline scripts, and never log tokens even at debug level in `pino`.

**Scalability**: the `features/*` structure lets an admin dashboard become a second Next app that imports shared packages (`@syncr/ui`, `@syncr/api-client`, `@syncr/types`) from a monorepo (Turborepo) without duplicating the auth/http layer — worth moving to a monorepo now if the admin app and mobile app are both near-term, since retrofitting shared packages later is more painful than starting with them.

---

*This assumes the BFF-lite cookie proxy in §3.5. If you'd rather keep the frontend purely as an API consumer with zero server-side cookie logic, use the memory-token approach in §3.1–3.4 only, and accept that a full page reload always costs one `/auth/refresh` round trip before the authenticated shell can render.*
