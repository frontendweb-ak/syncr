import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import { Errors } from "../../../errors";
import type { JwtService } from "../../../lib";
import { type Device, DeviceRepo, type NewDevice } from "./device.repo";

export class DeviceService extends LoggedService {
  private readonly repo: DeviceRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new DeviceRepo(db);
  }

  async registerDevice(data: NewDevice): Promise<Device> {
    return this.repo.create(data);
  }

  async getActiveDeviceByRefreshToken(
    refreshTokenHash: string,
  ): Promise<Device> {
    const device = await this.repo.findByRefreshTokenHash(refreshTokenHash);

    if (!device) {
      throw Errors.auth.tokenInvalid();
    }

    if (device.status !== "ACTIVE") {
      throw Errors.device.revoked();
    }

    return device;
  }

  async rotateRefreshToken(
    deviceId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<Device> {
    return this.repo.rotateRefreshToken(deviceId, refreshTokenHash, expiresAt);
  }

  /**
   * Update device last activity.
   */
  async touch(deviceId: string, ipAddress?: string): Promise<void> {
    await this.repo.updateLastSeen(deviceId, ipAddress);
  }

  /**
   * Update push token.
   */
  async updatePushToken(
    deviceId: string,
    pushToken: string | null,
  ): Promise<void> {
    await this.repo.updatePushToken(deviceId, pushToken);
  }

  /**
   * Logout current device.
   */
  async logout(deviceId: string): Promise<void> {
    await this.repo.revoke(deviceId);
  }

  /**
   * Logout every device.
   */
  async logoutAll(userId: string): Promise<void> {
    await this.repo.revokeAllByUser(userId);
  }

  /**
   * Active sessions for user.
   */
  async getUserDevices(userId: string): Promise<Device[]> {
    return this.repo.findActiveByUserId(userId);
  }

  /**
   * Enforce maximum active devices.
   */
  async enforceDeviceLimit(userId: string, limit: number): Promise<void> {
    const count = await this.repo.countActiveByUserId(userId);

    if (count >= limit) {
      throw Errors.device.limitExceeded(limit);
    }
  }

  /**
   * Background cleanup.
   */
  async cleanupExpired(): Promise<number> {
    await this.repo.expire();
    return this.repo.deleteExpired();
  }
}
