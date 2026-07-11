import {
  PROVIDER_CONNECTION_STATUS,
  Provider,
  REPOSITORY_ROLE,
  REPOSITORY_STATUS,
  RepositoryVisibility,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const providerEnum = pgEnum("provider", Provider);
export const providerConnectionStatusEnum = pgEnum(
  "provider_connection_status",
  PROVIDER_CONNECTION_STATUS,
);

export const repositoryStatusEnum = pgEnum(
  "repository_status",
  REPOSITORY_STATUS,
);
export const repositoryVisibilityEnum = pgEnum(
  "repository_visibility",
  RepositoryVisibility,
);

export const repositoryRoleEnum = pgEnum("repository_role", REPOSITORY_ROLE);