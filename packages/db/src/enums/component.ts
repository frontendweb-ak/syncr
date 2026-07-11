import { COMPONENT_FRAMEWORK } from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const componentFramework = pgEnum(
  "component_framework",
  COMPONENT_FRAMEWORK,
);
