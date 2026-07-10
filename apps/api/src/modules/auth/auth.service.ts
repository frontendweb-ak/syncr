import { verifyEmailTemplate, type EmailService } from "@syncr/notifications";
import type {
  DeviceInput,
  LoginAttemptInput,
  LoginMethod,
  SecurityEventInput,
  SignInInput,
  SignUpInput,
  User,
  UserStatus,
} from "@syncr/types";
import type { Logger } from "pino";
import { PLATFORM, type AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { UserService } from "../user";
import type { User as DbUser } from "../user/user.repo";
import { CredentialService } from "./credential/credential.service";
import { DeviceService, type Device } from "./device";
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
  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
    email: EmailService,
  ) {
    super(db, jwt, config, logger);
    this.email = email;

    //
    this.userService = new UserService(db, jwt, config, logger);
    this.credentialService = new CredentialService(db, jwt, config, logger);
    this.deviceService = new DeviceService(db, jwt, config, logger);
    this.securityEvents = new SecurityEventService(db);
    this.loginHistory = new LoginHistoryService(db);
    this.passwordService = new PasswordService();
    this.providerService = new AuthProviderService(db, jwt, config, logger);
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

  async registerGithub() {}

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
      const login: LoginAttemptInput = {
        ...attemptInput,
        failureReason: "INVALID_CREDENTIALS",
      };
      if (ipAddress !== undefined) login.ipAddress = ipAddress;
      await this.loginHistory.record(login);
      throw Errors.auth.invalidCredentials();
    }

    // email not verified
    if (!user.emailVerified) {
      const login: LoginAttemptInput = {
        ...attemptInput,
        failureReason: "INVALID_CREDENTIALS",
      };
      if (ipAddress !== undefined) login.ipAddress = ipAddress;
      await this.loginHistory.record(login);
      throw Errors.user.emailNotVerified();
    }

    const creds = await this.credentialService.getCredential(user.id);

    // Check lockout BEFORE Argon2id — saves expensive compute and avoids
    // timing signals (Technical Design §4.4)
    if (creds.lockedUntil && creds.lockedUntil > new Date()) {
      const login: LoginAttemptInput = {
        userId: user.id,
        loginIdentifier: input.email,
        loginMethod: "PASSWORD",
        success: false,
        failureReason: "ACCOUNT_LOCKED",
      };

      if (ipAddress !== undefined) {
        login.ipAddress = ipAddress;
      }

      await this.loginHistory.record(login);
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

      const loginHistoryInput: LoginAttemptInput = {
        userId: user.id,
        loginIdentifier: input.email,
        loginMethod: "PASSWORD",
        success: false,
        failureReason: "INVALID_CREDENTIALS",
      };
      if (input.device?.ipAddress !== undefined) {
        loginHistoryInput.ipAddress = input.device.ipAddress;
      }
      await this.loginHistory.record(loginHistoryInput);

      if (updated.lockedUntil && updated.lockedUntil > new Date()) {
        const event: SecurityEventInput = {
          userId: user.id,
          eventType: "ACCOUNT_LOCKED",
        };

        if (input.device?.ipAddress !== undefined) {
          event.ipAddress = input.device.ipAddress;
        }

        await this.securityEvents.record(event);
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
