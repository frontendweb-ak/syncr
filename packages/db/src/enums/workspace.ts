import { WorkspaceStatus } from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

export const workspaceStatusEnum = pgEnum("workspace_status", WorkspaceStatus);
