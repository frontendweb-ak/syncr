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



  export const SYSTEM_ROLE_SLUGS = {
    OWNER: "owner",
    ADMIN: "admin",
    MEMBER: "member",
    VIEWER: "viewer",
  } as const;

  export type SystemRoleSlug =
    (typeof SYSTEM_ROLE_SLUGS)[keyof typeof SYSTEM_ROLE_SLUGS];

  // Roles allowed to manage membership/invites/roles for an org. Matches
  // the resource matrix worked out earlier: OWNER and ADMIN both get
  // `member`/`role` full access, MEMBER and VIEWER get neither.
  export const ORG_MANAGER_ROLE_SLUGS: readonly SystemRoleSlug[] = [
    SYSTEM_ROLE_SLUGS.OWNER,
    SYSTEM_ROLE_SLUGS.ADMIN,
  ];
