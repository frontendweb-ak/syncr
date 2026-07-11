import { pgEnum } from "drizzle-orm/pg-core";

export const syncStatus = pgEnum("sync_status", [
  "PENDING",
  "PR_OPENED",
  "APPROVED",
  "REJECTED",
  "CONFLICT",
  "MERGED",
]);

export const syncEventType = pgEnum("sync_event_type", [
  "PROPOSED",
  "PR_OPENED",
  "PR_MERGED",
  "PR_CLOSED",
  "APPROVED",
  "REJECTED",
  "CONFLICT",
  "ROLLBACK",
]);

export const scanStatus = pgEnum("scan_status", [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);
export const syncProposalTypeEnum = pgEnum("sync_proposal_type", [
  "UPDATE",
  "ROLLBACK",
  "SECURITY",
  "MANUAL",
]);
export const syncStatusEnum = pgEnum("sync_status", [
  "PENDING",
  "GENERATING_PR",
  "PR_OPENED",
  "APPROVED",
  "MERGED",
  "REJECTED",
  "CONFLICT",
  "FAILED",
  "CANCELLED",
]);

export const vulnerabilityStatus = pgEnum("vulnerability_status", [
  "OPEN",
  "PATCHED",
  "DISMISSED",
  "FALSE_POSITIVE",
]);
