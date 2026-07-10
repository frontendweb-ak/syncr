import { SignUpInput, User } from "@syncr/types";
import type { Logger } from "pino";
import { type AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { UserService } from "../user";
import { CredentialService } from "./credential/credential.service";
import { DeviceService } from "./device";
import { assertPasswordStrength } from "./password/password-strength";
import { PasswordService } from "./password/password.service";
import { AuthProviderService } from "./provider";
import { LoginHistoryService, SecurityEventService } from "./security";

// const LOCKOUT_THRESHOLD = PLATFORM.AUTH_MAX_LOGIN_ATTEMPTS ?? 5;
// const LOCKOUT_MINUTES = PLATFORM.AUTH_LOCKOUT_MINUTES ?? 15;

export class AuthService extends LoggedService {
  private readonly userService: UserService;
  private readonly credentialService: CredentialService;

  private readonly deviceService: DeviceService;
  private readonly securityEvents: SecurityEventService;
  private readonly loginHistory: LoginHistoryService;

  private readonly providerService: AuthProviderService;
  private readonly passwordService: PasswordService;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);

    //
    this.userService = new UserService(db, jwt, config, logger);
    this.credentialService = new CredentialService(db, jwt, config, logger);
    this.deviceService = new DeviceService(db, jwt, config, logger);
    this.securityEvents = new SecurityEventService(db);
    this.loginHistory = new LoginHistoryService(db);
    this.passwordService = new PasswordService();
    this.providerService = new AuthProviderService(db, jwt, config, logger);
  }

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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
      image: user.image ?? "",
    };
  }

  // private method
}
