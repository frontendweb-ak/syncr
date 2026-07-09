import {
  EnvironmentVariableStatus,
  EnvironmentVariableType,
  ProjectEnvironmentStatus,
  ProjectEnvironmentType,
  ProjectStatus,
  ProjectVisibility,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", ProjectStatus);
export const projectVisibilityEnum = pgEnum(
  "project_visibility",
  ProjectVisibility,
);

export const projectEnvironmentStatusEnum = pgEnum(
  "project_environment_status",
  ProjectEnvironmentStatus,
);
export const projectEnvironmentTypeEnum = pgEnum(
  "project_environment_type",
  ProjectEnvironmentType,
);

export const environmentVariableStatusEnum = pgEnum(
  "environment_variables_status",
  EnvironmentVariableStatus,
);
export const environmentVariableTypeEnum = pgEnum(
  "environment_variables_type",
  EnvironmentVariableType,
);
