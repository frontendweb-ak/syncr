import { PLATFORM } from "../../config";
import { BaseController } from "../../core/base/base.controller";
import type { AppCtx } from "../../types/env";
import { AuthService } from "./auth.service";

const REFRESH_COOKIE_MAX_AGE =
  PLATFORM.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

export class AuthController extends BaseController {
  private service(c: AppCtx) {
    return new AuthService(
      c.get("db"),
      c.get("jwt"),
      c.get("config"),
      c.get("logger"),
    );
  }

  async register(c: AppCtx) {
    const body = await c.req.json();
  }

  login = async (c: AppCtx) => {
    const body = await c.req.json();
  };

  refresh = async (c: AppCtx) => {
    const body = await c.req.json();
  };

  logout = async (c: AppCtx) => {};
}
