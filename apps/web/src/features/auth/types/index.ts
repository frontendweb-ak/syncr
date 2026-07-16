import type { LucideIcon } from "lucide-react";

export type AuthAsideVariant =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "verify-success";

export type AuthAsideContent = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  image?: string;
};
