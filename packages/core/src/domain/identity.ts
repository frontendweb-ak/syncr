export type Plan = "FREE" | "STARTER" | "AGENCY" | "STUDIO" | "ENTERPRISE";
export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface Org {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
  createdAt: Date;
  meta: Record<string, unknown>;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface OrgMember {
  orgId: string;
  userId: string;
  role: Role;
}
