import { devices } from "@syncr/db";
import {
  and,
  eq,
  gt,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type Device = InferSelectModel<typeof devices>;
export type NewDevice = InferInsertModel<typeof devices>;

export class DeviceRepo extends BaseRepo {
  async create(data: NewDevice): Promise<Device> {
    const rows = await this.db.insert(devices).values(data).returning();
    return this.firstOrThrow(rows, Errors.device.createFailed());
  }
  async findById(id: string): Promise<Device | null> {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, id), eq(devices.status, "ACTIVE")))
      .limit(1);

    return device ?? null;
  }
  async findByRefreshTokenHash(hash: string): Promise<Device | null> {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.refreshTokenHash, hash),
          eq(devices.status, "ACTIVE"),
          gt(devices.expiresAt, new Date()),
          isNull(devices.revokedAt),
        ),
      )
      .limit(1);

    return device ?? null;
  }
  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<Device | null> {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)))
      .limit(1);

    return device ?? null;
  }
  async findByFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<Device | null> {
    const rows = await this.db
      .select()
      .from(devices)
      .where(
        and(eq(devices.userId, userId), eq(devices.fingerprint, fingerprint)),
      )
      .limit(1);

    return this.first(rows);
  }
  async findByUserId(
    userId: string,
    status?: Device["status"],
  ): Promise<Device[]> {
    return this.db
      .select()
      .from(devices)
      .where(
        status
          ? and(eq(devices.userId, userId), eq(devices.status, status))
          : eq(devices.userId, userId),
      );
  }
  async findByIdOrThrow(id: string): Promise<Device> {
    const rows = await this.db
      .select()
      .from(devices)
      .where(eq(devices.id, id))
      .limit(1);

    return this.firstOrThrow(rows, Errors.device.notFound());
  }
  async updateLastSeen(id: string, ipAddress?: string): Promise<void> {
    await this.db
      .update(devices)
      .set({
        lastActiveAt: new Date(),
        ipAddress,
        updatedAt: new Date(),
      })
      .where(and(eq(devices.id, id), eq(devices.status, "ACTIVE")));
  }
  async revoke(id: string): Promise<void> {
    await this.db
      .update(devices)
      .set({
        status: "REVOKED",
        revokedAt: new Date(),
        refreshTokenHash: null,
        expiresAt: null,
        lastRefreshAt: new Date(),
        updatedAt: new Date(),
        pushToken: null,
      })
      .where(eq(devices.id, id));
  }
  async revokeAllByUser(userId: string): Promise<number> {
    const result = await this.db
      .update(devices)
      .set({
        revokedAt: new Date(),
        refreshTokenHash: null,
        updatedAt: new Date(),
        status: "REVOKED",
        expiresAt: null,
        lastRefreshAt: new Date(),
        pushToken: null,
      })
      .where(eq(devices.userId, userId))
      .returning({
        id: devices.id,
      });

    return result.length;
  }
  async deleteExpired(): Promise<number> {
    const deleted = await this.db
      .delete(devices)
      .where(
        and(lt(devices.expiresAt, new Date()), eq(devices.status, "REVOKED")),
      )
      .returning({
        id: devices.id,
      });

    return deleted.length;
  }
  async findActiveByUserId(userId: string): Promise<Device[]> {
    return this.db
      .select()
      .from(devices)
      .where(and(eq(devices.userId, userId), eq(devices.status, "ACTIVE")));
  }

  async findByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<Device | null> {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.userId, userId),
          eq(devices.fingerprint, fingerprint),
          //eq(devices.status, "ACTIVE"),
        ),
      )
      .limit(1);

    return device ?? null;
  }

  async findActiveByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<Device | null> {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.userId, userId),
          eq(devices.fingerprint, fingerprint),
          eq(devices.status, "ACTIVE"),
        ),
      )
      .limit(1);

    return device ?? null;
  }

  async countActiveByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(devices)
      .where(and(eq(devices.userId, userId), eq(devices.status, "ACTIVE")));

    return Number(result[0]?.count ?? 0);
  }
  async rotateRefreshToken(
    id: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<Device> {
    const rows = await this.db
      .update(devices)
      .set({
        refreshTokenHash,
        expiresAt,
        lastRefreshAt: new Date(),
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(devices.id, id), eq(devices.status, "ACTIVE")))
      .returning();

    return this.firstOrThrow(rows, Errors.device.notFound());
  }
  async updatePushToken(id: string, pushToken: string | null): Promise<void> {
    await this.db
      .update(devices)
      .set({
        pushToken,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, id));
  }
  async updateDeviceInfo(
    id: string,
    data: {
      appVersion?: string;
      osVersion?: string;
      deviceName?: string;
    },
  ): Promise<void> {
    await this.db
      .update(devices)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, id));
  }
  async revokeByRefreshToken(refreshTokenHash: string): Promise<void> {
    await this.db
      .update(devices)
      .set({
        status: "REVOKED",
        revokedAt: new Date(),
        refreshTokenHash: null,
        expiresAt: null,
        updatedAt: new Date(),
        pushToken: null,
      })
      .where(eq(devices.refreshTokenHash, refreshTokenHash));
  }
  async expire(): Promise<number> {
    const rows = await this.db
      .update(devices)
      .set({
        status: "EXPIRED",
        updatedAt: new Date(),
        refreshTokenHash: null,
        expiresAt: null,
        lastRefreshAt: new Date(),
      })
      .where(
        and(lt(devices.expiresAt, new Date()), eq(devices.status, "ACTIVE")),
      )
      .returning({
        id: devices.id,
      });

    return rows.length;
  }

  /**
   * Increments devices.tokenVersion — immediately invalidates every
   * access token issued for this specific device (Technical Design §3.5).
   * Called on: single-device logout, refresh-token theft detection.
   * Returns new version for JWT signing.
   */
  async bumpTokenVersion(id: string): Promise<number> {
    const rows = await this.db
      .update(devices)
      .set({
        tokenVersion: sql`${devices.tokenVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, id))
      .returning({ tokenVersion: devices.tokenVersion });

    const row = rows[0];
    if (!row) throw new Error(`Device ${id} not found`);
    return row.tokenVersion;
  }
  async update(id: string, data: Partial<NewDevice>): Promise<Device> {
    const rows = await this.db
      .update(devices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.device.notFound());
  }
  async deleteRevokedOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 86400000);

    const rows = await this.db
      .delete(devices)
      .where(and(eq(devices.status, "REVOKED"), lt(devices.revokedAt, cutoff)))
      .returning({ id: devices.id });

    return rows.length;
  }
}
