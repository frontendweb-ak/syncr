export const OrganizationStatus = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
  "DELETED",
] as const;

export type OrganizationStatus = (typeof OrganizationStatus)[number];
export const OrganizationPlan = [
  "FREE",
  "PRO",
  "TEAM",
  "BUSINESS",
  "ENTERPRISE",
] as const;
export type OrganizationPlan = (typeof OrganizationPlan)[number];

export const OrganizationMemberStatus = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "REMOVED",
] as const;

export type OrganizationMemberStatus =
  (typeof OrganizationMemberStatus)[number];

export const OrganizationInviteStatus = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "REVOKED",
] as const;

export type OrganizationInviteStatus =
  (typeof OrganizationInviteStatus)[number];
