import type { DeviceType } from "./status";

export interface DeviceInput {
  deviceId: string;
  deviceType: DeviceType;
  platform?: string;
  osVersion?: string;
  deviceName?: string;
  appVersion?: string;
  pushToken?: string;
  userAgent?: string;
  ipAddress?: string;
}
