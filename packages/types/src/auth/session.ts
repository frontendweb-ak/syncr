export type Session = {
  id: string;
  userId: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  lastSeenAt?: string;
  ipAddress?: string;
  userAgent?: string;
  revokedAt?: string;
};
