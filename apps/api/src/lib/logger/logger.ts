import pino, { type Logger, type LoggerOptions } from "pino";
import type { AppConfig } from "../../config";

export function createLogger(config: AppConfig): Logger {
  const options: LoggerOptions = {
    level: config.APP_ENV === "development" ? "debug" : "info",

    base: {
      service: "syncr-api",
      environment: config.APP_ENV,
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "token",
        "refreshToken",
        "accessToken",
        "jwt",
        "secret",
      ],
      censor: "[REDACTED]",
    },
  };

  if (config.APP_ENV === "development") {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  return pino(options);
}
