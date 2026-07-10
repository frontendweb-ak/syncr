import type { DeviceInput } from "./device";

export type SignInInput = {
  email: string;
  password: string;
  device?: DeviceInput;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  device?: DeviceInput;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  role: string;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: "refresh";
};
