export const Provider = [
  "GITHUB",
  "GITLAB",
  "BITBUCKET",
  "AZURE_DEVOPS",
] as const;
export type Provider = (typeof Provider)[number];
export const PROVIDER_CONNECTION_STATUS = [
  "CONNECTED",
  "DISCONNECTED",
  "EXPIRED",
] as const;
export type ProviderConnectionStatus =
  (typeof PROVIDER_CONNECTION_STATUS)[number];
export const REPOSITORY_STATUS = [
  "ACTIVE",
  "ARCHIVED",
  "DISCONNECTED",
  "DELETED",
  "SYNCING",
  "ERROR",
] as const;

export type RepositoryStatus = (typeof REPOSITORY_STATUS)[number];
export const RepositoryVisibility = ["PRIVATE", "INTERNAL", "PUBLIC"] as const;

export const REPOSITORY_ROLE = ["SOURCE", "CONSUMER"] as const;
export type RepositoryRole = (typeof REPOSITORY_ROLE)[number];