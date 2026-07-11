// NOTE: your BRD models AuditLog.action as an exhaustive enum on purpose
// ("prevents arbitrary string actions that are hard to query"). Start
// with the actions your MVP routes actually perform and extend as you

import { pgEnum } from "drizzle-orm/pg-core";

// add routes — don't try to pre-enumerate everything on day one.
export const auditActionEnum = pgEnum("audit_action", [
  "ORG_UPDATED",
  "ORG_DELETED",
  "MEMBER_INVITED",
  "MEMBER_REMOVED",
  "MEMBER_ROLE_UPDATED",
  "REPO_CONNECTED",
  "REPO_DISCONNECTED",
  "COMPONENT_PUBLISHED",
  "COMPONENT_DEPRECATED",
  "COMPONENT_DELETED",
  "SYNC_APPROVED",
  "SYNC_REJECTED",
  "SYNC_BULK_APPROVED",
  "VULNERABILITY_DISMISSED",
  "VULNERABILITY_PATCHED",
  "TOKEN_CREATED",
  "TOKEN_REVOKED",
  "WEBHOOK_UPDATED",
]);

export const auditResourceTypeEnum = pgEnum("audit_resource_type", [
  "USER",
  "ORGANIZATION",
  "ORGANIZATION_MEMBER",
  "INVITATION",

  "PROJECT",
  "WORKSPACE",

  "PROVIDER_CONNECTION",
  "REPOSITORY",

  "COMPONENT",
  "COMPONENT_VERSION",

  "SYNC_PROPOSAL",

  "API_KEY",

  "WEBHOOK",

  "SETTING",

  "AUTH",
  "SYSTEM",
]);
