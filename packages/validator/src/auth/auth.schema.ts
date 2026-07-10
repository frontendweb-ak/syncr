import { z } from "zod";

export const Email = z
  .email({ message: "Please enter a valid email address" })
  .transform((v) => v.toLowerCase());

export const Password = z
  .string({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password cannot exceed 128 characters" });

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
export const RegisterSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  email: Email,
  password: Password,
});
