import {
  DEVICE_TYPE,
  type DeviceInput,
  type DeviceType as DeviceTypeValue,
} from "@syncr/types";

export function parseDeviceType(value: unknown): DeviceTypeValue {
  if (
    typeof value === "string" &&
    DEVICE_TYPE.includes(value as DeviceTypeValue)
  ) {
    return value as DeviceTypeValue;
  }

  return "WEB";
}

export function normalizeDevice(device: DeviceInput): DeviceInput {
  return {
    ...device,
    deviceType: device.deviceType ?? "WEB",
  };
}

/**
 * For web later use in nextjs cut and past into web
 * 
 * headers: {
  "x-device-id": getDeviceId(),
  "x-device-type": "WEB",
  "x-platform": getBrowserName(),
  "x-app-version": process.env.NEXT_PUBLIC_APP_VERSION,
}
 */
const DEVICE_ID_KEY = "syncr-device-id";
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
