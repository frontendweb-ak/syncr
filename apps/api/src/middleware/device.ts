// middleware/device.ts

import { getConnInfo } from "@hono/node-server/conninfo";
import type { DeviceInput } from "@syncr/types";
import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types/env";
import { parseDeviceType } from "../utils/device-type";

export const deviceMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const ip =
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-real-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      getConnInfo(c).remote.address;

    const deviceId = c.req.header("X-Device-Id");

    const device: DeviceInput = {
      fingerprint: deviceId ?? crypto.randomUUID(),
      deviceType: parseDeviceType(c.req.header("x-device-type")),
      platform: c.req.header("x-platform") ?? "WEB",
      ...(c.req.header("x-platform-version")
        ? { osVersion: c.req.header("x-platform-version") }
        : {}),

      ...(c.req.header("x-device-name")
        ? { deviceName: c.req.header("x-device-name") }
        : {}),

      ...(c.req.header("x-app-version")
        ? { appVersion: c.req.header("x-app-version") }
        : {}),

      ...(c.req.header("x-push-token")
        ? { pushToken: c.req.header("x-push-token") }
        : {}),

      ...(c.req.header("user-agent")
        ? { userAgent: c.req.header("user-agent") }
        : {}),

      ...(ip ? { ipAddress: ip } : {}),
    };

    c.set("device", device);

    await next();
  },
);
