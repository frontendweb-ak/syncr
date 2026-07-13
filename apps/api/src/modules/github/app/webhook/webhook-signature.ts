// src/modules/github/webhook/webhook-signature.ts
//
// Verifies the X-Hub-Signature-256 header GitHub sends on every webhook
// delivery. Written with Web Crypto (crypto.subtle) rather than Node's
// `crypto` module — matches the pattern your auth.service.ts already
// uses for hashToken(), which keeps this working on both Node and
// Workers without a runtime check.
//
// CRITICAL: this must run against the RAW request body bytes, before any
// JSON.parse. If your Hono route calls c.req.json() first, the signature
// will never match — read c.req.text() (or .arrayBuffer()) and verify
// BEFORE parsing. See github-webhook.route.ts.

export async function verifyGithubSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  const computed =
    "sha256=" +
    Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return timingSafeEqual(computed, signatureHeader);
}

// String-length-independent-ish comparison. Not perfectly constant-time
// in JS (nothing running in a JIT truly is), but avoids the obvious
// short-circuit-on-first-mismatch timing leak that `===` has.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
