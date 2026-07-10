import type { Db } from "@syncr/db";
import { checkDatabase } from "@syncr/db";
import type { Logger } from "pino";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HealthService } from "./health.service";

vi.mock("@aim/db", async () => {
  const actual = await vi.importActual<typeof import("@syncr/db")>("@aim/db");

  return {
    ...actual,
    checkDatabase: vi.fn(),
  };
});

describe("HealthService", () => {
  const db = {} as Db;

  const logger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns healthy when database is up", async () => {
    vi.mocked(checkDatabase).mockResolvedValue({
      status: "up",
      latency: 5,
    });

    const service = new HealthService(db, logger, {
      service: "syncr-api",
      environment: "test",
      version: "1.0.0",
    });

    const result = await service.check();

    expect(result.success).toBe(true);
    expect(result.status).toBe("healthy");
    expect(result.service).toBe("syncr-api");
    expect(result.environment).toBe("test");
    expect(result.version).toBe("1.0.0");
    expect(result.timestamp).toBeDefined();
    expect(result.database.status).toBe("up");
  });

  it("returns degraded when database is down", async () => {
    vi.mocked(checkDatabase).mockResolvedValue({
      status: "down",
      latency: 5,
      error: "Connection failed",
    });

    const service = new HealthService(db, logger, {
      service: "syncr-api",
      environment: "test",
      version: "1.0.0",
    });

    const result = await service.check();

    expect(result.success).toBe(false);
    expect(result.status).toBe("degraded");
    expect(result.database.status).toBe("down");
  });

  it("logs and rethrows unexpected errors", async () => {
    const error = new Error("Database exploded");

    vi.mocked(checkDatabase).mockRejectedValue(error);

    const service = new HealthService(db, logger, {
      service: "syncr-api",
      environment: "test",
      version: "1.0.0",
    });

    await expect(service.check()).rejects.toThrow("Database exploded");

    expect(logger.error).toHaveBeenCalledWith(
      { err: error },
      "Health check failed",
    );
  });
});
