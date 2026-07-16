import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { AuthAsideContent, AuthAsideVariant } from "../types";

export const AUTH_ASIDE_CONTENT: Record<AuthAsideVariant, AuthAsideContent> = {
  login: {
    icon: ShieldCheck,
    eyebrow: "Welcome Back",
    title: "Secure access to your workspace.",
    description:
      "Continue where you left off. Your projects, documents and team are waiting.",
    features: [
      "Enterprise-grade security",
      "Fast and secure authentication",
      "Access all workspaces",
    ],
  },

  register: {
    icon: UserPlus,
    eyebrow: "Create Account",
    title: "Build your workspace with Syncr.",
    description:
      "Create your account and start managing projects, teams and AI workflows.",
    features: [
      "Unlimited workspaces",
      "Invite team members",
      "AI powered productivity",
    ],
  },

  "forgot-password": {
    icon: KeyRound,
    eyebrow: "Password Recovery",
    title: "Forgot your password?",
    description:
      "No worries. We'll send you instructions to securely reset your password.",
    features: [
      "Secure email verification",
      "One-time reset link",
      "Fast account recovery",
    ],
  },

  "reset-password": {
    icon: LockKeyhole,
    eyebrow: "Reset Password",
    title: "Create a strong new password.",
    description: "Choose a password that's unique and difficult to guess.",
    features: [
      "Protected account",
      "Encrypted authentication",
      "Instant activation",
    ],
  },

  "verify-email": {
    icon: Mail,
    eyebrow: "Verify Email",
    title: "Check your inbox.",
    description:
      "We've sent a verification email. Confirm your email address to continue.",
    features: [
      "Email verification",
      "Secure account activation",
      "Spam folder reminder",
    ],
  },

  "verify-success": {
    icon: CheckCircle2,
    eyebrow: "Success",
    title: "Your email has been verified.",
    description: "Everything is ready. Continue to your workspace.",
    features: [
      "Account activated",
      "Secure authentication enabled",
      "Ready to get started",
    ],
  },
};
