import type { Context } from "hono";
import type { AppContext } from "../types/env";

export function getClientIp(c: Context<AppContext>): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-real-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
