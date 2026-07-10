// config/constants

export const PLATFORM = {
  // ── Commission & tax ────────────────────────────────────────
  COMMISSION_PCT: 0.12, // 12% AIM platform commission
  GST_PCT: 0.18, // 18% GST on programme fee
  CASHFREE_TDR_PCT: 0.0175, // 1.75% Cashfree transaction fee

  // ── Mentor capacity thresholds ───────────────────────────────
  MENTOR_TIERS: {
    NEW: { maxStudents: 10, minCompletions: 0, minRating: 0 },
    RISING: { maxStudents: 20, minCompletions: 5, minRating: 4.5 },
    SENIOR: { maxStudents: 30, minCompletions: 15, minRating: 4.7 },
    PREMIUM: { maxStudents: 50, minCompletions: 30, minRating: 4.8 },
    ELITE: { maxStudents: 100, minCompletions: 0, minRating: 0 },
  },

  // ── SLAs (in hours / days) ───────────────────────────────────
  MENTOR_RESPONSE_SLA_HOURS: 48,
  DISPUTE_RESOLUTION_DAYS: 7,
  REQUIREMENT_EXPIRY_DAYS: 30,

  // ── Pagination ───────────────────────────────────────────────
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,

  // ── File uploads ─────────────────────────────────────────────
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024, // 25 MB
  ALLOWED_MIME_TYPES: {
    document: ["application/pdf", "image/jpeg", "image/png", "image/heic"],
    avatar: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    evidence: ["application/pdf", "image/jpeg", "image/png"],
  } as Record<string, string[]>,

  // ── OTP ──────────────────────────────────────────────────────
  OTP_TTL_SECONDS: 300, // 5 minutes
  OTP_RATE_WINDOW: 600, // 10 minutes

  // Auth / session
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY_DAYS: 30, // 30 days
  AUTH_MAX_LOGIN_ATTEMPTS: 5, // lockout after this many consecutive failures
  AUTH_LOCKOUT_MINUTES: 15, // how long the lockout lasts
  MAX_DEVICES_PER_USER: 10, // max simultaneous active sessions
  SESSION_EXPIRY_DAYS: 30, // refresh token lifetime
  OTP_MAX_ATTEMPTS: 3, // per 10-min window

  // ── Rate limits (requests / window) ──────────────────────────
  RATE_LIMITS: {
    default: { requests: 60, windowSeconds: 60 },
    auth: { requests: 5, windowSeconds: 60 },
    upload: { requests: 10, windowSeconds: 60 },
    checkout: { requests: 20, windowSeconds: 60 },
    payment: { requests: 20, windowSeconds: 60 },
    messaging: { requests: 120, windowSeconds: 60 },
    admin: { requests: 120, windowSeconds: 60 },
    webhook: { requests: 500, windowSeconds: 60 },
  },

  // ── Milestones (default structure for new mentorships) ───────
  DEFAULT_MILESTONES: [
    {
      label: "Diagnostic Assessment & Blueprint",
      sortOrder: 1,
      escrowReleasePct: 25,
    },
    { label: "Mid-Programme Review", sortOrder: 2, escrowReleasePct: 25 },
    { label: "Evaluations Complete", sortOrder: 3, escrowReleasePct: 25 },
    {
      label: "Final Review & Programme Completion",
      sortOrder: 4,
      escrowReleasePct: 25,
    },
  ] as const,

  // google

  google: {
    GOOGLE_JWKS_URL: "https://www.googleapis.com/oauth2/v3/certs",
    GOOGLE_ISSUERS: ["accounts.google.com", "https://accounts.google.com"],
  },
} as const;
