import { z } from "zod";

export const CreateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "slug may only contain lowercase letters, numbers, and hyphens")
    .min(3)
    .max(48)
    .optional(),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const CreateInviteSchema = z.object({
  email: z.email().trim().toLowerCase(),
  roleId: z.uuid().optional(),
});
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(32),
});
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
