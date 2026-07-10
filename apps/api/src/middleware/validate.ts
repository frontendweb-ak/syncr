import { zValidator } from "@hono/zod-validator";
import type z from "zod";

import { ValidationException } from "../errors/validation.error";

export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fields[key]) {
      fields[key] = [];
    }
    fields[key].push(issue.message);
  }

  return fields;
}
function throwValidation(error: z.ZodError): never {
  throw new ValidationException(formatZodError(error));
}

export const validate = <T extends z.ZodType>(schema: T) =>
  zValidator("json", schema, (result) => {
    if (!result.success) {
      throw throwValidation(result.error as unknown as z.ZodError);
    }
  });

export const validateBody = validate;
export const validateQuery = <T extends z.ZodType>(schema: T) =>
  zValidator("query", schema, (result) => {
    if (!result.success) throwValidation(result.error as unknown as z.ZodError);
  });

export const validateParams = <T extends z.ZodType>(schema: T) =>
  zValidator("param", schema, (result) => {
    if (!result.success) throwValidation(result.error as unknown as z.ZodError);
  });
