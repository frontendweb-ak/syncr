import { HttpException } from "../exceptions";

export const githubErrors = {
  github: {
    appNotConfigured: () =>
      new HttpException(
        500,
        "GITHUB_APP_NOT_CONFIGURED",
        "GitHub App is not configured.",
      ),
    installStateInvalid: () =>
      new HttpException(
        401,
        "GITHUB_INSTALL_STATE_INVALID",
        "GitHub installation state is invalid or expired.",
      ),
    jwtSignFailed: () =>
      new HttpException(
        500,
        "GITHUB_APP_JWT_SIGN_FAILED",
        "Failed to create GitHub App JWT.",
      ),

    installationNotFound: () =>
      new HttpException(
        404,
        "GITHUB_INSTALLATION_NOT_FOUND",
        "GitHub installation not found.",
      ),

    installationSuspended: () =>
      new HttpException(
        423,
        "GITHUB_INSTALLATION_SUSPENDED",
        "GitHub installation has been suspended.",
      ),

    installationUninstalled: () =>
      new HttpException(
        410,
        "GITHUB_INSTALLATION_UNINSTALLED",
        "GitHub installation has been uninstalled.",
      ),

    tokenMintFailed: (status?: number) =>
      new HttpException(
        502,
        "GITHUB_TOKEN_MINT_FAILED",
        status
          ? `GitHub token mint failed with status ${status}.`
          : "Failed to create GitHub installation token.",
      ),

    invalidWebhookSignature: () =>
      new HttpException(
        401,
        "GITHUB_WEBHOOK_INVALID_SIGNATURE",
        "GitHub webhook signature verification failed.",
      ),

    webhookDeliveryFailed: () =>
      new HttpException(
        500,
        "GITHUB_WEBHOOK_DELIVERY_FAILED",
        "Failed to process GitHub webhook.",
      ),

    rateLimited: () =>
      new HttpException(
        429,
        "GITHUB_API_RATE_LIMITED",
        "GitHub API rate limit exceeded.",
      ),

    apiError: (status: number, message?: string) =>
      new HttpException(
        502,
        "GITHUB_API_ERROR",
        message ?? `GitHub API returned status ${status}.`,
      ),

    repositoryNotFound: () =>
      new HttpException(
        404,
        "GITHUB_REPOSITORY_NOT_FOUND",
        "Repository not found.",
      ),

    permissionDenied: () =>
      new HttpException(
        403,
        "GITHUB_PERMISSION_DENIED",
        "Permission denied by GitHub.",
      ),

    insufficientPermissions: (permission?: string) =>
      new HttpException(
        403,
        "GITHUB_INSUFFICIENT_PERMISSIONS",
        permission
          ? `Missing GitHub permission: ${permission}.`
          : "GitHub App lacks required permissions.",
      ),

    installationAccessExpired: () =>
      new HttpException(
        401,
        "GITHUB_INSTALLATION_ACCESS_EXPIRED",
        "GitHub installation token expired.",
      ),
  },
};
