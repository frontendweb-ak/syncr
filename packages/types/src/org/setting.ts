export interface OrganizationSettings {
  branding?: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };

  security?: {
    requireMfa?: boolean;
    allowPasswordLogin?: boolean;
    allowGithubLogin?: boolean;
    sessionTimeoutMinutes?: number;
  };

  github?: {
    defaultBranch?: string;
    autoSync?: boolean;
    webhookEnabled?: boolean;
  };

  ai?: {
    enabled?: boolean;
    autoFix?: boolean;
    codeReview?: boolean;
  };

  notifications?: {
    email?: boolean;
    push?: boolean;
    slack?: boolean;
  };

  featureFlags?: Record<string, boolean>;
}