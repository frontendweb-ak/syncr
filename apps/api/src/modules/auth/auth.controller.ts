import { created, ok } from "../../core/base/base.controller";
import type { AppCtx } from "../../types/env";
import { AuthService } from "./auth.service";

// const REFRESH_COOKIE_MAX_AGE =
//   PLATFORM.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

function makeAuthService(c: AppCtx) {
  return new AuthService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
    c.get("email"),
  );
}

export const authController = {
  async register(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    try {
      const result = await service.registerEmail({
        name: body.name,
        email: body.email,
        password: body.password,
      });
      return created(c, result);
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  // login
  async loginEmail(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);

    const result = await service.loginEmail({
      email: body.email,
      password: body.password,
      device: c.get("device"),
    });

    return ok(c, result);
  },
};
