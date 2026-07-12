import { permissions } from "../src/schema";
import type { Db } from "../src/types";

export const PERMISSIONS = [
  { resource: "organization", action: "read" },
  { resource: "organization", action: "update" },
  { resource: "organization", action: "delete" },
  { resource: "organization", action: "transfer_owner" },

  { resource: "member", action: "read" },
  { resource: "member", action: "invite" },
  { resource: "member", action: "remove" },
  { resource: "member", action: "update_role" },

  { resource: "role", action: "read" },
  { resource: "role", action: "create" },
  { resource: "role", action: "update" },
  { resource: "role", action: "delete" },

  { resource: "workspace", action: "read" },
  { resource: "workspace", action: "create" },
  { resource: "workspace", action: "update" },
  { resource: "workspace", action: "archive" },

  { resource: "repository", action: "read" },
  { resource: "repository", action: "create" },
  { resource: "repository", action: "update" },
  { resource: "repository", action: "delete" },

  { resource: "component", action: "read" },
  { resource: "component", action: "create" },
  { resource: "component", action: "update" },
  { resource: "component", action: "delete" },

  { resource: "sync", action: "read" },
  { resource: "sync", action: "create" },
  { resource: "sync", action: "approve" },
  { resource: "sync", action: "reject" },

  { resource: "scan", action: "read" },
  { resource: "scan", action: "create" },
  { resource: "scan", action: "cancel" },

  { resource: "vulnerability", action: "read" },
  { resource: "vulnerability", action: "update" },

  { resource: "secret", action: "read" },
  { resource: "secret", action: "create" },
  { resource: "secret", action: "update" },
  { resource: "secret", action: "delete" },

  { resource: "variable", action: "read" },
  { resource: "variable", action: "create" },
  { resource: "variable", action: "update" },
  { resource: "variable", action: "delete" },

  { resource: "api_key", action: "read" },
  { resource: "api_key", action: "create" },
  { resource: "api_key", action: "revoke" },

  { resource: "billing", action: "read" },
  { resource: "billing", action: "update" },

  { resource: "subscription", action: "read" },
  { resource: "subscription", action: "update" },

  { resource: "audit_log", action: "read" },

  { resource: "security_event", action: "read" },
] as const;

export async function seedPermissions(db: Db) {
  const values = PERMISSIONS.map((permission) => ({
    name: `syncr:${permission.resource}:${permission.action}`,
    resource: permission.resource,
    action: permission.action,
    isSystem: true,
  })) satisfies (typeof permissions.$inferInsert)[];

  await db.insert(permissions).values(values).onConflictDoNothing({
    target: permissions.name,
  });
}
