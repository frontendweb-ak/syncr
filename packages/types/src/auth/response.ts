import type { Session } from "./session";
import type { User } from "./user";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  expiresAt: number;
};

export type RefreshToken = {
  refreshToken: string;
};

export type AuthResponse = {
  user: User;
  session: Session;
  tokens: TokenPair;
};

export type SignInResponse = AuthResponse;
export type SignUpResponse = AuthResponse;
export type RefreshResponse = never;
