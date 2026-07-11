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
import { validate, validateQuery } from "../../middleware/validate";
import type { AppContext } from "../../types/env";
import { authController } from "./auth.controller";

const auth = new Hono<AppContext>();

auth.post("/register", validate(RegisterSchema), authController.register);
auth.post("/login", validate(LoginSchema), authController.loginEmail);
auth.get(
  "/verify-email",
  validateQuery(VerifyEmailQuerySchema),
  authController.verifyEmail,
);

auth.post("/refresh", validate(RefreshTokenSchema), authController.refresh);

auth.post(
  "/forgot-password",
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

