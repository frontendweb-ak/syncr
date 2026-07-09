import {
  Provider,
  ProviderConnectionStatus,
  RepositoryStatus,
  RepositoryVisibility,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const providerEnum = pgEnum("provider", Provider);
export const providerConnectionStatusEnum = pgEnum(
  "provider_connection_status",
  ProviderConnectionStatus,
);

export const repositoryStatusEnum = pgEnum(
  "repository_status",
  RepositoryStatus,
);
export const repositoryVisibilityEnum = pgEnum(
  "repository_visibility",
  RepositoryVisibility,
);
