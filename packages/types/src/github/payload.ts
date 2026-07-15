export interface InstallationToken {
  token: string;
  expiresAt: Date;
  permissions: Record<string, string>;
  repositorySelection: "all" | "selected";
}

export interface UpsertProviderConnectionInput {
  organizationId: string;
  provider: "GITHUB" | "GITLAB" | "BITBUCKET" | "AZURE_DEVOPS";
  accountId: string;
  accountName: string;
  installationId: string;
  status: "CONNECTED" | "DISCONNECTED" | "EXPIRED";
  permissionsSnapshot: Record<string, string>;
  suspendedAt: Date | null;
  uninstalledAt: Date | null;
}

export interface CreateWebhookEventInput {
  deliveryId: string;
  event: string;
  payload: unknown;
  providerConnectionId: string | null;
}
