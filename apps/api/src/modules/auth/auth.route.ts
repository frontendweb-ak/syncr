// src/modules/auth/auth.route.ts
//
// API Contract: 04_AUTH_API_CONTRACT.md
// All routes mounted under /api/v1/auth (see routes.ts)

import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleLoginSchema,
  LoginSchema,
  MfaEnableConfirmSchema,
  MfaVerifySchema,
  RefreshTokenSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyEmailQuerySchema,
} from "@syncr/validator";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { rateLimitMiddleware } from "../../middleware/rate-limit";
import { validate, validateQuery } from "../../middleware/validate";
import type { AppContext } from "../../types/env";
import { getClientIp } from "../../utils/network";
import { authController } from "./auth.controller";

const auth = new Hono<AppContext>();

auth.post(
  "/register",
  rateLimitMiddleware("REGISTER"),
  validate(RegisterSchema),
  authController.register,
);
auth.post(
  "/login",
  rateLimitMiddleware("LOGIN", async (c) => {
    const body = await c.req.json();
    return `login:${getClientIp(c)}:${body.email.toLowerCase()}`;
  }),
  validate(LoginSchema),
  authController.loginEmail,
);
auth.get(
  "/verify-email",
  rateLimitMiddleware("VERIFY_EMAIL"),
  validateQuery(VerifyEmailQuerySchema),
  authController.verifyEmail,
);

auth.post(
  "/refresh",
  rateLimitMiddleware("REFRESH_TOKEN"),
  validate(RefreshTokenSchema),
  authController.refresh,
);

auth.post(
  "/forgot-password",
  rateLimitMiddleware("FORGOT_PASSWORD"),
  validate(ForgotPasswordSchema),
  authController.forgotPassword,
);
auth.post(
  "/reset-password",
  validate(ResetPasswordSchema),
  authController.resetPassword,
);
// Second step of login when the account has MFA enabled — loginEmail
// returns a short-lived challengeToken instead of tokens in that case.
auth.post("/mfa/verify", validate(MfaVerifySchema), authController.verifyMfa);
auth.post(
  "/oauth/google",
  validate(GoogleLoginSchema),
  authController.loginGoogle,
);

// ── Authenticated ───────────────────────────────────────────────────
auth.post("/logout", authMiddleware, authController.logout);
auth.post("/logout-all", authMiddleware, authController.logoutAll);
auth.get("/devices", authMiddleware, authController.getDevices);
auth.delete("/devices/:deviceId", authMiddleware, authController.revokeDevice);

auth.post("/mfa/enable", authMiddleware, authController.enableMfa);

auth.post(
  "/mfa/enable/confirm",
  authMiddleware,
  validate(MfaEnableConfirmSchema),
  authController.confirmMfa,
);

auth.post("/mfa/disable", authMiddleware, authController.disableMfa);

auth.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordSchema),
  authController.changePassword,
);

export { auth as authRoutes };

