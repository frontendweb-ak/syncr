import { created, noContent, ok } from "../../core/base/base.controller";
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

  async loginGoogle(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    const result = await service.loginWithGoogle({
      idToken: body.idToken,
      role: body.role,
      device: c.get("device"),
    });
    return ok(c, result);
  },

  async verifyEmail(c: AppCtx) {
    console.log("C", c.req.query("token"));
    const token = c.req.query("token");
    const service = makeAuthService(c);
    await service.verifyEmail(token);
    return ok(c, {
      success: true,
      message: "Email verified successfully.",
    });
  },

  async refresh(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    console.log("Body", body);
    const result = await service.refreshTokens(body);
    return ok(c, result);
  },

  async forgotPassword(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    // Always 200 regardless of whether the email exists — never leak
    // account existence through this endpoint.
    await service.forgotPassword(body.email);
    return ok(c, {
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  },

  async resetPassword(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    await service.resetPassword(body.token, body.password);
    return ok(c, {
      success: true,
      message: "Password reset. Please log in again.",
    });
  },

  async changePassword(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();
    const service = makeAuthService(c);
    await service.changePassword({
      userId: auth.sub,
      deviceId: auth.deviceId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    return ok(c, {
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
  },

  // logout

  async logout(c: AppCtx) {
    const auth = c.get("auth");
    const service = makeAuthService(c);
    await service.logout(auth.sub, auth.deviceId);
    c.header(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=0",
    );
    return ok(c, { success: true,messsage:"You have successfully logged out" });
  },

  async logoutAll(c: AppCtx) {
    const auth = c.get("auth");
    console.log("AUTH", auth);
    const service = makeAuthService(c);
    await service.logoutAll(auth.sub);
    c.header(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=0",
    );
    return ok(c, { success: true });
  },

  // devices

  async getDevices(c: AppCtx) {
    const auth = c.get("auth");
    const service = makeAuthService(c);
    const devices = await service.getDevices(auth.sub);
    return ok(c, {
      devices: devices.map((d) => ({
        id: d.id,
        deviceType: d.deviceType,
        platform: d.platform,
        deviceName: d.deviceName,
        lastActiveAt: d.lastActiveAt,
        isCurrentDevice: d.id === auth.deviceId,
        status: d.status,
      })),
    });
  },

  async revokeDevice(c: AppCtx) {
    const auth = c.get("auth");
    const deviceId = c.req.param("id");

    const service = makeAuthService(c);
    await service.logout(auth.sub, deviceId);
    return ok(c, { revoked: true });
  },
  // verify mfa
  async verifyMfa(c: AppCtx) {
    const body = await c.req.json();
    const service = makeAuthService(c);
    const result = await service.verifyMfaAndCompleteLogin(
      body.challengeToken,
      body.code,
      c.get("device"),
    );
    return ok(c, result);
  },

  async enableMfa(c: AppCtx) {
    const auth = c.get("auth");
    const service = makeAuthService(c);
    // Returns { secret, otpauthUrl, qrCodeDataUrl } — MFA isn't actually
    // "on" until confirmMfa verifies the user can generate a valid code.
    const result = await service.startMfaEnrollment(auth.sub);
    return ok(c, result);
  },

  async confirmMfa(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();
    const service = makeAuthService(c);
    await service.confirmMfaEnrollment(auth.sub, body.code);
    return ok(c, { success: true, message: "MFA enabled." });
  },

  async disableMfa(c: AppCtx) {
    const auth = c.get("auth");
    const service = makeAuthService(c);
    await service.disableMfa(auth.sub);
    return noContent(c);
  },
};
