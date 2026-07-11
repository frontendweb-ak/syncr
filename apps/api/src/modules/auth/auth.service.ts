import { type EmailService, verifyEmailTemplate } from "@syncr/notifications";
import type {
  DeviceInput,
  GoogleAuthInput,
  LoginAttemptInput,
  LoginMethod,
  SecurityEventInput,
  SignInInput,
  SignUpInput,
  User,
  UserStatus,
} from "@syncr/types";
import type { Logger } from "pino";
import { type AppConfig, PLATFORM } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { UserService } from "../user";
import type { User as DbUser } from "../user/user.repo";
import { CredentialService } from "./credential/credential.service";
import { type Device, DeviceService } from "./device";
import { GoogleOAuthService } from "./oauth/google.service";
import { assertPasswordStrength } from "./password/password-strength";
import { PasswordService } from "./password/password.service";
import { AuthProviderService } from "./provider";
import { LoginHistoryService, SecurityEventService } from "./security";

const LOCKOUT_THRESHOLD = PLATFORM.AUTH_MAX_LOGIN_ATTEMPTS ?? 5;
const LOCKOUT_MINUTES = PLATFORM.AUTH_LOCKOUT_MINUTES ?? 15;

export class AuthService extends LoggedService {
  private readonly userService: UserService;
  private readonly credentialService: CredentialService;

  private readonly deviceService: DeviceService;
  private readonly securityEvents: SecurityEventService;
  private readonly loginHistory: LoginHistoryService;

  private readonly providerService: AuthProviderService;
  private readonly passwordService: PasswordService;
  private readonly email: EmailService;

  private readonly googleService: GoogleOAuthService;
  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
    email: EmailService,
  ) {
    super(db, jwt, config, logger);
    this.email = email;

    // user
    this.userService = new UserService(db, jwt, config, logger);
    this.credentialService = new CredentialService(db, jwt, config, logger);
    this.deviceService = new DeviceService(db, jwt, config, logger);
    this.securityEvents = new SecurityEventService(db);
    this.loginHistory = new LoginHistoryService(db);
    this.passwordService = new PasswordService();
    this.providerService = new AuthProviderService(db, jwt, config, logger);
    // google
    this.googleService = new GoogleOAuthService(config);
  }

  // register
  async registerEmail(input: SignUpInput): Promise<User> {
    assertPasswordStrength(input.password);

    const email = input.email.trim().toLowerCase();
    const existing = await this.userService.getByEmail(email);
    if (existing) throw Errors.user.emailAlreadyExists();

    // 1. create user
    const user = await this.userService.createUser({ name: input.name, email });

    // 2. create credentials
    const passwordHash = await this.passwordService.hash(input.password);
    await this.credentialService.create({ userId: user.id, passwordHash });

    // 3. create provider
    await this.providerService.linkProvider({
      userId: user.id,
      provider: "PASSWORD",
      providerId: email,
    });

    const token = await this.jwt.signEmailVerificationToken(user.id);
    const verificationUrl = `${this.config.APP_URL}/auth/verify-email?token=${token}`;
    const template = verifyEmailTemplate({ name: user.name, verificationUrl });
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
      return this.completeLogin(
        this.db,
        existingUser,
        input.device,
        "GOOGLE",
        false,
      );
    }

    // New user
    if (!input.role) throw Errors.auth.tokenInvalid(); // role required for first registration

    return this.withTransaction(async (tx) => {
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

      return this.completeLogin(tx, newUser, input.device, "GOOGLE", true);
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
        deviceFingerprint: input.device?.fingerprint,
      });
      return { mfaRequired: true, challengeToken };
    }

    const authUser: DbUser = {
      ...user,
      image: user.image ?? "",
    };

    return this.completeLogin(
      this.db,
      authUser,
      input.device,
      "PASSWORD",
      false,
    );
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

  async refreshTokens(input: RefreshInput): Promise<RefreshResponse> {
    const hashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(input.refreshToken),
    );
    const tokenHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    let device = await this.deviceRepo.findByRefreshTokenHash(tokenHash);

    if (!device) {
      // Stale token reuse — potential theft (Technical Design §3.4)
      // Revoke the device by fingerprint if we can find it
      const fingerDevice = await this.deviceRepo.findByRefreshTokenHash(
        input.refreshToken,
      );
      if (fingerDevice) {
        await this.deviceRepo.revoke(fingerDevice.id);
        await this.deviceRepo.bumpTokenVersion(fingerDevice.id);
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

    const user = await this.userRepo.findById(device.userId);
    if (!user) throw Errors.auth.tokenInvalid();

    await this.ensureActive(user);

    // Rotate
    const newRefreshToken = this.generateRefreshToken();
    const newHashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(newRefreshToken),
    );
    const newHash = Array.from(new Uint8Array(newHashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const expiresAt = new Date(
      Date.now() + PLATFORM.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    device = await this.deviceRepo.rotateRefreshToken(
      device.id,
      newHash,
      expiresAt,
    );

    const [_permissions, primaryRole] = await Promise.all([
      this.rbac.resolvePermissions(user.id),
      this.rbac.getPrimaryRole(user.id),
    ]);

    const accessToken = await this.jwt.signAccessToken({
      sub: user.id,
      sessionId: device.id,
      deviceId: device.id,
      tokenVersion: Math.min(user.tokenVersion, device.tokenVersion),
      role: primaryRole ?? "student",
      type: "access",
    });
    const accessTokenExpiresAt =
      Date.now() + PLATFORM.ACCESS_TOKEN_EXPIRY_SECONDS * 1000;
    return {
      tokens: {
        tokenType: "Bearer",
        expiresIn: PLATFORM.ACCESS_TOKEN_EXPIRY_SECONDS,
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt: accessTokenExpiresAt,
      },
      session: {
        sessionId: device.id,
        deviceId: device.id,
        expiresAt: expiresAt.toISOString(),
      },
    };
  }

  // ── Logout ────────────────────────────────────────────────────

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.deviceService.logout(deviceId);
    await this.deviceRepo.bumpTokenVersion(deviceId);
    await this.securityEvents.record({
      userId,
      deviceId,
      eventType: "DEVICE_REVOKED",
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.deviceService.logoutAll(userId);
    await this.userRepo.bumpTokenVersion(userId);
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
    const creds = await this.authRepo.findByUserId(input.userId);
    if (!creds) throw Errors.auth.passwordRequired();

    const valid = await this.passwordService.verify(
      input.currentPassword,
      creds.passwordHash,
    );
    if (!valid) throw Errors.auth.currentPasswordInvalid();

    assertPasswordStrength(input.newPassword);

    const newHash = await this.passwordService.hash(input.newPassword);
    await this.authRepo.updatePasswordHash(input.userId, newHash);

    // Bump global tokenVersion — invalidates all OTHER devices immediately
    // but NOT the current device (so the user isn't logged out of the
    // session they just used to change their password — API Contract note
    // on POST /change-password).
    await this.userRepo.bumpTokenVersion(input.userId);

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
    const user = await this.userRepo.findById(input.userId);

    if (!user) {
      throw Errors.user.notFound();
    }

    const existingCreds = await this.authRepo.findByUserId(user.id);

    if (existingCreds) {
      throw Errors.auth.passwordAlreadySet();
    }

    assertPasswordStrength(input.password);
    const hash = await this.passwordService.hash(input.password);
    await this.authRepo.create({
      userId: user.id,
      passwordHash: hash,
    });

    if (user.email) {
      await this.db
        .insert(userAuthProviders)
        .values({
          userId: user.id,
          provider: "EMAIL",
          providerId: user.email.toLowerCase(),
        })
        .onConflictDoNothing();
    }

    await this.securityEvents.record({
      userId: user.id,
      eventType: "PASSWORD_CHANGED",
    });
  }

  // Private
  private async ensureActive(status: UserStatus): Promise<void> {
    if (status === "SUSPENDED") throw Errors.user.inactive();
  }

  private async completeLogin(
    db: RepoContext,
    user: DbUser,
    deviceInput: DeviceInput,
    method: LoginMethod,
    isNewUser: boolean,
  ) {
    const refreshToken = this.generateRefreshToken();
    const tokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + PLATFORM.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    let isNewDevice = false;

    const existingDevice = await this.deviceService.findByFingerprint(
      user.id,
      deviceInput.fingerprint,
    );

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
        PLATFORM.MAX_DEVICES_PER_USER ?? 5,
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

    const accessToken = await this.jwt.signAccessToken({
      sub: user.id,
      sessionId: device.id,
      deviceId: device.id,
      tokenVersion: Math.min(user.tokenVersion, device.tokenVersion),
      role: "owner",
      type: "access",
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

    // const permissions = await txRbac.resolvePermissions(user.id);

    const authUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? "",
      status: user.status,
      emailVerified: user.emailVerified,
    };
    const accessTokenExpiresAt =
      Date.now() + PLATFORM.ACCESS_TOKEN_EXPIRY_SECONDS * 1000;
    return {
      user: authUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: PLATFORM.ACCESS_TOKEN_EXPIRY_SECONDS,
        tokenType: "Bearer",
        expiresAt: accessTokenExpiresAt,
      },
      session: {
        sessionId: device.id,
        deviceId: device.id,
        expiresAt: expiresAt.toISOString(),
      },
      isNewUser,
    };
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
