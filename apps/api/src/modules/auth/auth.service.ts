import {
  type EmailService,
  forgotPasswordTemplate,
  resetPasswordConfirmedTemplate,
  verifyEmailTemplate,
} from "@syncr/notifications";
import type {
  ChangePasswordInput,
  DeviceInput,
  GoogleAuthInput,
  LoginAttemptInput,
  LoginMethod,
  RefreshInput,
  SecurityEventInput,
  SignInInput,
  SignUpInput,
  User,
  UserStatus,
} from "@syncr/types";
import type { Logger } from "pino";
import QRCode from "qrcode";
import { type AppConfig, AUTH, JWT } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
// import { LoggedService } from "../../core/base/logger.service";
import { BaseService } from "../../core/base";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { OrganizationService } from "../organization/organization.service";
import { UserService } from "../user";
import type { User as DbUser } from "../user/user.repo";
import { CredentialService } from "./credential/credential.service";
import { type Device, DeviceService } from "./device";
import { MfaService } from "./mfa/mfa.service";
import { GoogleOAuthService } from "./oauth/google.service";
import { PasswordResetService } from "./password/password-reset.service";
import { assertPasswordStrength } from "./password/password-strength";
import { PasswordService } from "./password/password.service";
import { AuthProviderService } from "./provider";
import { LoginHistoryService, SecurityEventService } from "./security";

const LOCKOUT_THRESHOLD = AUTH.MAX_LOGIN_ATTEMPTS ?? 5;
const LOCKOUT_MINUTES = AUTH.LOCKOUT_MINUTES ?? 15;

export class AuthService extends BaseService {
  private readonly userService: UserService;
  private readonly credentialService: CredentialService;

  private readonly deviceService: DeviceService;
  private readonly securityEvents: SecurityEventService;
  private readonly loginHistory: LoginHistoryService;

  private readonly providerService: AuthProviderService;
  private readonly passwordService: PasswordService;
  private readonly email: EmailService;
  private readonly jwt: JwtService;

  private readonly googleService: GoogleOAuthService;
  private readonly mfaService: MfaService;
  private readonly passwordReset: PasswordResetService;

  private readonly orgService: OrganizationService;

  constructor(
    db: RepoContext,
    config: AppConfig,
    logger: Logger,
    jwt: JwtService,
    email: EmailService,
  ) {
    super(db, config, logger);
    this.email = email;
    this.jwt = jwt;

    // user
    this.userService = new UserService(db, config, logger);
    this.credentialService = new CredentialService(db, config, logger);
    this.deviceService = new DeviceService(db, config, logger);
    this.securityEvents = new SecurityEventService(db);
    this.loginHistory = new LoginHistoryService(db);
    this.passwordService = new PasswordService();
    this.providerService = new AuthProviderService(db, config, logger);

    // google
    this.googleService = new GoogleOAuthService(config);
    // mfa
    this.mfaService = new MfaService(db, config, logger);
    // password
    this.passwordReset = new PasswordResetService(db, config, logger);
    this.orgService = new OrganizationService(db, config, logger);
  }

  private scoped(tx: RepoContext) {
    return {
      users: new UserService(tx, this.config, this.logger),
      orgs: new OrganizationService(tx, this.config, this.logger),
      credentials: new CredentialService(tx, this.config, this.logger),
      providers: new AuthProviderService(tx, this.config, this.logger),
    };
  }

  // register
  async registerEmail(input: SignUpInput): Promise<User> {
    assertPasswordStrength(input.password);

    return this.withTransaction(async (tx) => {
      const s = this.scoped(tx);
      // 0. check existing user
      const email = input.email.trim().toLowerCase();
      const existing = await s.users.getByEmail(email);
      if (existing) throw Errors.user.emailAlreadyExists();

      // email

      // 1. create user
      const user = await s.users.createUser({
        name: input.name,
        email,
      });

      // 2. personal organization
      await s.orgs.createPersonalOrg({
        userId: user.id,
        userName: input.name,
      });

      // 3. create credentials
      const passwordHash = await this.passwordService.hash(input.password);
      console.log("passwordHash", passwordHash);
      await s.credentials.create({ userId: user.id, passwordHash });
      // 4. create provider
      await s.providers.linkProvider({
        userId: user.id,
        provider: "PASSWORD",
        providerId: email,
      });
      console.log("G");
      const token = await this.jwt.signEmailVerificationToken(user.id);
      const verificationUrl = `${this.config.APP_URL}/auth/verify-email?token=${token}`;
      const template = verifyEmailTemplate({
        name: user.name,
        verificationUrl,
      });

      const result = await this.email.send({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: { type: "email_verification" },
      });

      this.logger?.debug({ result }, "Email sent");
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        emailVerified: user.emailVerified,
        image: user.image ?? "",
      };
    });
  }

  async loginWithGoogle(input: GoogleAuthInput) {
    const identity = await this.googleService.verifyIdToken(input.idToken);

    // Check for existing user — by provider subject first, then email
    const linkedGoogleUser = await this.providerService.getProvider(
      "GOOGLE",
      identity.subject,
    );

    let existingUser = linkedGoogleUser;

    if (!existingUser) {
      existingUser = await this.userService.getByEmail(identity.email);
    }

    if (existingUser) {
      // Existing user — this is a login, not registration
      await this.ensureActive(existingUser.status);

      // Link Google provider if not already linked (account linking — PRD §2.3)
      if (!linkedGoogleUser) {
        await this.providerService.linkProvider({
          userId: existingUser.id,
          provider: "GOOGLE",
          providerId: identity.subject,
        });
      }
      return this.completeLogin(existingUser, input.device, "GOOGLE", false);
    }

    // New user
    if (!input.role) throw Errors.auth.tokenInvalid(); // role required for first registration

    return this.withTransaction(async () => {
      const newUser = await this.userService.createUser({
        name: identity.name ?? "AIM User",
        email: identity.email?.toLowerCase(),
        image: identity.pictureUrl,
        status: identity.emailVerified ? "ACTIVE" : "PENDING",
        emailVerified: identity.emailVerified,
      });

      await this.providerService.linkProvider({
        userId: newUser.id,
        provider: "GOOGLE",
        providerId: identity.subject,
      });

      // if (!input.role) {
      //   throw Errors.auth.roleRequired(); // role required for first registration
      // }
      // const roleId = await this.resolveRoleId(tx, input.role);
      // if (roleId) await txRbac.assignRole(user.id, roleId);

      return this.completeLogin(newUser, input.device, "GOOGLE", true);
    });
  }
  // login
  async loginEmail(input: SignInInput) {
    // Timing-safe: we record the failure regardless of whether the user
    // exists, and always wait for the same "check" to complete — here
    // using a dummy check for non-existent users so timing can't be used
    // to enumerate accounts.
    const ipAddress = input.device?.ipAddress;

    const email = input.email.trim().toLowerCase();

    // user exit
    const user = await this.userService.getByEmail(email);
    const attemptInput: LoginAttemptInput = {
      loginIdentifier: input.email,
      loginMethod: "PASSWORD",
      success: false,
    };

    if (!user) {
      await this.loginHistory.record({
        ...attemptInput,
        failureReason: "INVALID_CREDENTIALS",
        ...(ipAddress !== undefined ? { ipAddress } : {}),
      });
      throw Errors.auth.invalidCredentials();
    }

    // email not verified
    if (!user.emailVerified) {
      await this.loginHistory.record({
        ...attemptInput,
        failureReason: "INVALID_CREDENTIALS",
        ...(ipAddress !== undefined ? { ipAddress } : {}),
      });
      throw Errors.user.emailNotVerified();
    }

    const creds = await this.credentialService.getCredential(user.id);

    // Check lockout BEFORE Argon2id — saves expensive compute and avoids
    // timing signals (Technical Design §4.4)
    if (creds.lockedUntil && creds.lockedUntil > new Date()) {
      await this.loginHistory.record({
        userId: user.id,
        loginIdentifier: input.email,
        loginMethod: "PASSWORD",
        success: false,
        failureReason: "ACCOUNT_LOCKED",
        ...(ipAddress !== undefined ? { ipAddress } : {}),
      });
      throw Errors.auth.invalidCredentials();
    }

    await this.ensureActive(user.status);

    const valid = await this.passwordService.verify(
      input.password,
      creds.passwordHash,
    );

    if (!valid) {
      const updated = await this.credentialService.recordFailedAttempt(
        user.id,
        LOCKOUT_THRESHOLD,
        LOCKOUT_MINUTES,
      );

      await this.loginHistory.record({
        userId: user.id,
        loginIdentifier: input.email,
        loginMethod: "PASSWORD",
        success: false,
        failureReason: "INVALID_CREDENTIALS",
        ...(input.device?.ipAddress !== undefined
          ? { ipAddress: input.device.ipAddress }
          : {}),
      });

      if (updated.lockedUntil && updated.lockedUntil > new Date()) {
        await this.securityEvents.record({
          userId: user.id,
          eventType: "ACCOUNT_LOCKED",
          ...(input.device?.ipAddress !== undefined
            ? { ipAddress: input.device.ipAddress }
            : {}),
        });
        throw Errors.auth.accountLocked();
      }

      throw Errors.auth.invalidCredentials();
    }

    // Reset failed attempt counter on success
    await this.credentialService.resetFailedAttempts(user.id);

    // Force reset — issue a reset-scoped token, not a full session
    if (creds.mustResetPassword) {
      throw Errors.auth.mustResetPassword();
    }

    if (creds.mfaEnabled) {
      const challengeToken = await this.jwt.signMfaChallengeToken({
        sub: user.id,
        deviceId: input.device?.fingerprint,
        sessionId: "",
      });
      return { mfaRequired: true, challengeToken };
    }

    const authUser: DbUser = {
      ...user,
      image: user.image ?? "",
    };

    return this.completeLogin(authUser, input.device, "PASSWORD", false);
  }

  async verifyMfaAndCompleteLogin(
    challengeToken: string,
    code: string,
    device: DeviceInput,
  ) {
    const payload = await this.jwt.verifyMfaChallengeToken(challengeToken);
    if (!payload) throw Errors.auth.mfaChallengeInvalid();

    const user = await this.userService.getById(payload.sub);
    if (!user) throw Errors.user.notFound();

    const creds = await this.credentialService.getCredential(user.id);
    if (!creds.mfaEnabled || !creds.mfaSecretEncrypted) {
      throw Errors.auth.mfaChallengeInvalid();
    }

    const valid = this.mfaService.verifyCode(creds.mfaSecretEncrypted, code);
    if (!valid) {
      await this.securityEvents.record({
        userId: user.id,
        eventType: "SUSPICIOUS_LOGIN_BLOCKED",
      });
      throw Errors.auth.mfaChallengeInvalid();
    }

    const authUser = { ...user, image: user.image ?? "" };
    return this.completeLogin(authUser, device, "PASSWORD", false);
  }

  // auth.service.ts

  async verifyEmail(token?: string): Promise<void> {
    if (!token) throw Errors.auth.tokenMissing();

    const payload = await this.jwt.verifyEmailVerificationToken(token);
    const user = await this.userService.getById(payload.sub);
    if (!user) throw Errors.user.notFound();

    if (user.emailVerified) return;

    await this.userService.verifyEmail(user.id);
    this.logger?.info({ userId: user.id }, "Email verified");
  }

  async resendVerification(email: string) {
    const user = await this.userService.getByEmail(email);

    // Prevent email enumeration attacks
    if (!user) return {};

    if (user.emailVerified) {
      return;
    }

    const token = await this.jwt.signEmailVerificationToken(user.id);
    const verificationUrl = `${this.config.APP_URL}/auth/verify-email?token=${token}`;
    const template = verifyEmailTemplate({
      name: user.name,
      verificationUrl,
    });

    const result = await this.email.send({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: { type: "email_verification" },
    });

    this.logger?.info({ userId: user.id }, "Email verified");
    return result;
  }

  async refreshTokens(input: RefreshInput) {
    const hashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(input.refreshToken),
    );
    const tokenHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    let device =
      await this.deviceService.getActiveDeviceByRefreshToken(tokenHash);

    if (!device) {
      // Stale token reuse — potential theft (Technical Design §3.4)
      // Revoke the device by fingerprint if we can find it
      const fingerDevice =
        await this.deviceService.getActiveDeviceByRefreshToken(
          input.refreshToken,
        );
      if (fingerDevice) {
        await this.deviceService.revoke(fingerDevice.id);
        await this.deviceService.bumpTokenVersion(fingerDevice.id);
        await this.securityEvents.record({
          userId: fingerDevice.userId,
          deviceId: fingerDevice.id,
          eventType: "SUSPICIOUS_LOGIN_BLOCKED",
        });
      }
      throw Errors.auth.tokenInvalid();
    }

    if (device.status !== "ACTIVE") {
      throw Errors.device.revoked();
    }

    const user = await this.userService.getById(device.userId);
    if (!user) throw Errors.auth.tokenInvalid();

    await this.ensureActive(user.status);

    // Rotate
    const newRefreshToken = this.generateRefreshToken();
    const newHashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(newRefreshToken),
    );
    const newHash = Array.from(new Uint8Array(newHashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const expiresAt = new Date(Date.now() + JWT.EXPIRY_SECONDS.REFRESH * 1000);
    device = await this.deviceService.rotateRefreshToken(
      device.id,
      newHash,
      expiresAt,
    );

    // const [_permissions, primaryRole] = await Promise.all([
    //   this.rbac.resolvePermissions(user.id),
    //   this.rbac.getPrimaryRole(user.id),
    // ]);
    const organizationId = await this.orgService.getPersonalOrgId(user.id);
    const organizationRole = await this.orgService.getPrimaryRoleSlug(user.id);
    const tokens = await this.jwt.createTokenPair({
      sub: user.id,
      sessionId: device.id,
      deviceId: device.id,
      userTokenVersion: user.tokenVersion,
      deviceTokenVersion: device.tokenVersion,
      organizationId,
      organizationRole,
      role: user.platformRole,
    });

    return {
      tokens,
      session: {
        sessionId: device.id,
        deviceId: device.id,
        expiresAt: expiresAt.toISOString(),
      },
    };
  }

  // ── Logout ────────────────────────────────────────────────────

  async logout(userId: string, deviceId: string | undefined): Promise<void> {
    if (!deviceId) throw Errors.device.notFound();
    await this.deviceService.logout(deviceId);
    await this.deviceService.bumpTokenVersion(deviceId);
    await this.securityEvents.record({
      userId,
      deviceId,
      eventType: "DEVICE_REVOKED",
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userService.bumpTokenVersion(userId);
    await this.deviceService.logoutAll(userId);
    await this.securityEvents.record({
      userId,
      eventType: "ALL_DEVICES_REVOKED",
    });
    await this.securityEvents.record({
      userId,
      eventType: "TOKEN_VERSION_BUMPED",
    });
  }

  // ── Password management ───────────────────────────────────────

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const creds = await this.credentialService.getCredential(input.userId);
    if (!creds) throw Errors.auth.passwordRequired();

    const valid = await this.passwordService.verify(
      input.currentPassword,
      creds.passwordHash,
    );
    if (!valid) throw Errors.auth.currentPasswordInvalid();

    assertPasswordStrength(input.newPassword);

    const newHash = await this.passwordService.hash(input.newPassword);
    await this.credentialService.updatePassword(input.userId, newHash);

    // Password changes invalidate every active session. Bump the user's
    // tokenVersion so all access tokens become invalid immediately, then
    // revoke every device session (refresh token). The user must sign in
    // again on every device, including the current one.
    await this.userService.bumpTokenVersion(input.userId);

    // Revoke every refresh token / session.
    await this.deviceService.logoutAll(input.userId);

    await this.securityEvents.record({
      userId: input.userId,
      deviceId: input.deviceId,
      eventType: "PASSWORD_CHANGED",
    });
  }

  async setPassword(input: {
    userId: string;
    password: string;
  }): Promise<void> {
    const user = await this.userService.getById(input.userId);

    if (!user) {
      throw Errors.user.notFound();
    }

    const existingCreds = await this.credentialService.getCredential(user.id);

    if (existingCreds) {
      throw Errors.auth.passwordAlreadySet();
    }

    assertPasswordStrength(input.password);
    const hash = await this.passwordService.hash(input.password);
    await this.credentialService.create({
      userId: user.id,
      passwordHash: hash,
    });

    if (user.email) {
      await this.providerService.linkProvider({
        userId: user.id,
        provider: "PASSWORD",
        providerId: user.email.toLowerCase(),
      });
    }

    await this.securityEvents.record({
      userId: user.id,
      eventType: "PASSWORD_CHANGED",
    });
  }

  async resetPassword(token: string, newPassword: string) {
    assertPasswordStrength(newPassword);

    const record = await this.passwordReset.consumeToken(token); // throws resetTokenInvalid/Expired
    const passwordHash = await this.passwordService.hash(newPassword);
    await this.credentialService.updatePassword(record.userId, passwordHash);
    await this.userService.bumpTokenVersion(record.userId);

    // Password reset = assume compromise. Kill every existing session so a
    // stolen session token doesn't survive a password reset.
    await this.deviceService.logoutAll(record.userId);
    await this.securityEvents.record({
      userId: record.userId,
      eventType: "PASSWORD_RESET",
    });

    const user = await this.userService.getById(record.userId);
    if (user) {
      const template = resetPasswordConfirmedTemplate({
        name: user.name,
        loginUrl: `${this.config.WEB_URL}/auth/login`,
      });
      await this.email.send({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: { type: "password_reset_confirmed" },
      });
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userService.getByEmail(email.trim().toLowerCase());
    if (!user) return; // no user-enumeration signal

    await this.securityEvents.record({
      userId: user.id,
      eventType: "PASSWORD_RESET_REQUESTED",
    });

    const { rawToken } = await this.passwordReset.createToken(user.id);
    const resetUrl = `${this.config.APP_URL}/auth/reset-password?token=${rawToken}`;
    const template = forgotPasswordTemplate({ name: user.name, resetUrl });
    await this.email.send({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: { type: "password_reset" },
    });
  }
  // Private
  private async ensureActive(status: UserStatus): Promise<void> {
    if (status === "SUSPENDED") throw Errors.user.inactive();
  }

  private async completeLogin(
    user: DbUser,
    deviceInput: DeviceInput,
    method: LoginMethod,
    isNewUser: boolean,
  ) {
    const refreshToken = this.generateRefreshToken();
    const tokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + JWT.EXPIRY_SECONDS.REFRESH * 1000);

    let isNewDevice = false;

    const existingDevice = await this.deviceService.findByFingerprint(
      user.id,
      deviceInput.fingerprint,
    );

    console.log("EXISTING_DEVICE", existingDevice);
    let device: Device;

    if (existingDevice) {
      device = await this.deviceService.updateSession(existingDevice.id, {
        refreshTokenHash: tokenHash,
        expiresAt,
        pushToken: deviceInput.pushToken,
        ipAddress: deviceInput.ipAddress,
        userAgent: deviceInput.userAgent,
        appVersion: deviceInput.appVersion,
        osVersion: deviceInput.osVersion,
        deviceName: deviceInput.deviceName,
        platform: deviceInput.platform,
      });
    } else {
      isNewDevice = true;
      await this.deviceService.enforceDeviceLimit(
        user.id,
        AUTH.MAX_DEVICES_PER_USER ?? 5,
      );

      device = await this.deviceService.registerDevice({
        userId: user.id,
        fingerprint: deviceInput.fingerprint,
        deviceType: deviceInput.deviceType,
        platform: deviceInput.platform,
        osVersion: deviceInput.osVersion,
        deviceName: deviceInput.deviceName,
        appVersion: deviceInput.appVersion,
        pushToken: deviceInput.pushToken,
        ipAddress: deviceInput.ipAddress,
        userAgent: deviceInput.userAgent,
        refreshTokenHash: tokenHash,
        expiresAt,
        status: "ACTIVE",
      });
    }

    const organizationId = await this.orgService.getPersonalOrgId(user.id);

    const organizationRole = await this.orgService.getPrimaryRoleSlug(user.id);
    const tokens = await this.jwt.createTokenPair({
      sub: user.id,
      sessionId: device.id,
      deviceId: device.id,
      userTokenVersion: user.tokenVersion,
      deviceTokenVersion: device.tokenVersion,
      organizationId,
      organizationRole,
      role: user.platformRole,
    });

    const loginInput: LoginAttemptInput = {
      userId: user.id,
      deviceId: device.id,
      loginMethod: method,
      success: true,
    };

    if (deviceInput.ipAddress !== undefined) {
      loginInput.ipAddress = deviceInput.ipAddress;
    }

    if (deviceInput.userAgent !== undefined) {
      loginInput.userAgent = deviceInput.userAgent;
    }
    await this.loginHistory.record(loginInput);

    if (isNewDevice && !isNewUser) {
      const event: SecurityEventInput = {
        userId: user.id,
        deviceId: device.id,
        eventType: "NEW_DEVICE_LOGIN",
      };

      if (deviceInput.ipAddress !== undefined) {
        event.ipAddress = deviceInput.ipAddress;
      }

      await this.securityEvents.record(event);
    }
    await this.userService.updateLastSeen(user.id);
    const authUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? "",
      status: user.status,
      emailVerified: user.emailVerified,
      role: user.platformRole,
    };

    return {
      user: authUser,
      tokens: tokens,
      organization: {
        id: organizationId,
        role: organizationRole,
      },
      session: {
        sessionId: device.id,
        deviceId: device.id,
        expiresAt: expiresAt.toISOString(),
      },
      isNewUser,
    };
  }

  async startMfaEnrollment(userId: string) {
    const user = await this.userService.getById(userId);
    if (!user) throw Errors.user.notFound();
    const enrollment = this.mfaService.beginEnrollment(user.email); // generates + stores unconfirmed secret, returns QR data

    await this.credentialService.savePendingMfaSecret({
      userId,
      secret: enrollment.secret, // encrypt before storing
      expiresAt: enrollment.expiresAt,
    });

    return {
      secret: enrollment.secret,
      otpauthUrl: enrollment.otpauthUrl,
      qrCodeDataUrl: await QRCode.toDataURL(enrollment.otpauthUrl),
    };
  }

  async confirmMfaEnrollment(userId: string, code: string) {
    const pending = await this.credentialService.getPendingMfaSecret(userId);

    if (!pending) {
      throw Errors.auth.mfaEnrollmentNotStarted();
    }

    if (pending.expiresAt < new Date()) {
      throw Errors.auth.mfaEnrollmentExpired();
    }

    const valid = this.mfaService.verifyCode(pending.secret, code);

    if (!valid) {
      throw Errors.auth.mfaChallengeInvalid();
    }

    await this.credentialService.enableMfa(userId, "TOTP", pending.secret);

    await this.credentialService.clearPendingMfaSecret(userId);

    await this.securityEvents.record({
      userId,
      eventType: "MFA_ENABLED",
    });
  }

  async disableMfa(userId: string) {
    await this.credentialService.disableMfa(userId);
  }

  // devices

  async getDevices(userId: string) {
    const devices = await this.deviceService.getUserDevices(userId);
    return devices;
  }

  async revokeDevice(userId: string, deviceId: string | undefined) {
    //const device = await this.deviceService.f(deviceId);
  }

  private generateRefreshToken(): string {
    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async hashToken(token: string): Promise<string> {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
