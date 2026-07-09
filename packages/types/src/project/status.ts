export const ProjectStatus = [
  "ACTIVE",
  "ARCHIVED",
  "SUSPENDED",
  "DELETED",
] as const;

export type ProjectStatus = (typeof ProjectStatus)[number];

export const ProjectVisibility = ["PRIVATE", "INTERNAL", "PUBLIC"] as const;

export type ProjectVisibility = (typeof ProjectVisibility)[number];

export const ProjectEnvironmentStatus = [
  "ACTIVE",
  "ARCHIVED",
  "DELETED",
] as const;

export const ProjectEnvironmentType = [
  "DEVELOPMENT",
  "TEST",
  "QA",
  "STAGING",
  "PRODUCTION",
  "PREVIEW",
  "CUSTOM",
] as const;

export const EnvironmentVariableType = [
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "JSON",
] as const;

export const EnvironmentVariableStatus = ["ACTIVE", "ARCHIVED"] as const;
