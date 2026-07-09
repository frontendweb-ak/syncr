export const Provider = [
  "GITHUB",
  "GITLAB",
  "BITBUCKET",
  "AZURE_DEVOPS",
] as const;

export const ProviderConnectionStatus = [
  "CONNECTED",
  "DISCONNECTED",
  "EXPIRED",
] as const;

export const RepositoryStatus = [
  "ACTIVE",
  "ARCHIVED",
  "DISCONNECTED",
  "DELETED",
] as const;

export const RepositoryVisibility = ["PRIVATE", "INTERNAL", "PUBLIC"] as const;
