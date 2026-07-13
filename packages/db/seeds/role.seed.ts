import { roles } from "../src/schema";
import type { Db } from "../src/types";

export const SYSTEM_ROLES = [
  {
    name: "Owner",
    slug: "owner",
    description: "Organization owner",
    isSystem: true,
    isDefault: false,
    priority: 1000,
  },
  {
    name: "Admin",
    slug: "admin",
    description: "Organization administrator",
    isSystem: true,
    isDefault: false,
    priority: 800,
  },
  {
    name: "Member",
    slug: "member",
    description: "Default member role",
    isSystem: true,
    isDefault: true,
    priority: 500,
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read only access",
    isSystem: true,
    isDefault: false,
    priority: 100,
  },
];
export async function seedRoles(db: Db) {
  await db.insert(roles).values(SYSTEM_ROLES).onConflictDoNothing();
}
