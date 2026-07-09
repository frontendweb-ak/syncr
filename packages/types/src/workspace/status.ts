export const WorkspaceStatus = [
  "ACTIVE",
  "ARCHIVED",
  "SUSPENDED",
  "DELETED",
] as const;

export type WorkspaceStatus =
  (typeof WorkspaceStatus)[number];