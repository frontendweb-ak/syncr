import type { UserStatus } from "./status";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
