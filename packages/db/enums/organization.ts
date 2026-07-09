import {
  OrganizationInviteStatus,
  OrganizationMemberStatus,
  OrganizationPlan,
  OrganizationStatus,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const organizationStatusEnum = pgEnum(
  "organization_status",
  OrganizationStatus,
);
export const organizationPlanEnum = pgEnum(
  "organization_plan",
  OrganizationPlan,
);

export const organizationMemberStatusEnum = pgEnum(
  "organizationMember_status",
  OrganizationMemberStatus,
);

export const organizationInviteStatusEnum = pgEnum(
  "organizationInvite_status",
  OrganizationInviteStatus,
);
