import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Base Validators */
/* -------------------------------------------------------------------------- */

export const Email = z
  .email({ message: "Please enter a valid email address" })
  .transform((v) => v.toLowerCase());

export const Password = z
  .string({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password cannot exceed 128 characters" });

export const JwtToken = z
  .string({ message: "Token is required" })
  .trim()
  .min(1, { message: "Token is required" });

export const OtpCode = z
  .string({ message: "OTP code is required" })
  .trim()
  .regex(/^\d{6}$/, {
    message: "OTP code must be 6 digits",
  });

export const Phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, ""))
  .refine((v) => /^(\+91)?[6-9]\d{9}$/.test(v), {
    message: "Please enter a valid Indian mobile number",
  })
  .transform((v) => {
    const number = v.replace(/^\+91/, "");
    return `+91${number}`;
  });

/* -------------------------------------------------------------------------- */
/* Register */
/* -------------------------------------------------------------------------- */

export const RegisterSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(2, {
      message: "Name must be at least 2 characters long",
    })
    .max(100, {
      message: "Name cannot exceed 100 characters",
    }),

  email: Email,
  password: Password,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/* -------------------------------------------------------------------------- */
/* Login */
/* -------------------------------------------------------------------------- */

export const LoginSchema = z.object({
  email: Email,
  password: Password,
});

export type LoginInput = z.infer<typeof LoginSchema>;

/* -------------------------------------------------------------------------- */
/* Verify Email */
/* -------------------------------------------------------------------------- */

export const VerifyEmailQuerySchema = z.object({
  token: JwtToken,
});

export type VerifyEmailQuery = z.infer<
  typeof VerifyEmailQuerySchema
>;

/* -------------------------------------------------------------------------- */
/* Refresh Token */
/* -------------------------------------------------------------------------- */

export const RefreshTokenSchema = z.object({
  refreshToken: JwtToken,
});

export type RefreshTokenInput = z.infer<
  typeof RefreshTokenSchema
>;

/* -------------------------------------------------------------------------- */
/* Forgot Password */
/* -------------------------------------------------------------------------- */

export const ForgotPasswordSchema = z.object({
  email: Email,
});

export type ForgotPasswordInput = z.infer<
  typeof ForgotPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/* Reset Password */
/* -------------------------------------------------------------------------- */

export const ResetPasswordSchema = z
  .object({
    token: JwtToken,
    password: Password,
    confirmPassword: Password,
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    },
  );

export type ResetPasswordInput = z.infer<
  typeof ResetPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/* MFA Verification */
/* -------------------------------------------------------------------------- */

export const MfaVerifySchema = z.object({
  token: JwtToken,
  code: OtpCode,
});

export type MfaVerifyInput = z.infer<
  typeof MfaVerifySchema
>;

/* -------------------------------------------------------------------------- */
/* Google Login */
/* -------------------------------------------------------------------------- */

export const GoogleLoginSchema = z.object({
  idToken: JwtToken,
});

export type GoogleLoginInput = z.infer<
  typeof GoogleLoginSchema
>;


export const MfaEnableConfirmSchema = z.object({
  code: OtpCode,
});

export type MfaEnableConfirmInput = z.infer<
  typeof MfaEnableConfirmSchema
>;

/* -------------------------------------------------------------------------- */
/* Change Password                                                            */
/* -------------------------------------------------------------------------- */
/*
 * Requires authentication.
 *
 * User must know current password.
 */

export const ChangePasswordSchema = z
  .object({
    currentPassword: Password,

    newPassword: Password,

    confirmPassword: Password,
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    },
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      path: ["newPassword"],
      message:
        "New password must be different from current password",
    },
  );

export type ChangePasswordInput = z.infer<
  typeof ChangePasswordSchema
>;