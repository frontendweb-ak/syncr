// app.constants.ts

export const APP = {
  COMMISSION_PCT: 0.12, // 12% AIM platform commission
  GST_PCT: 0.18, // 18% GST on programme fee
  CASHFREE_TDR_PCT: 0.0175, // 1.75% Cashfree transaction fee

  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,

  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
  ALLOWED_MIME_TYPES: {
    document: ["application/pdf", "image/jpeg", "image/png", "image/heic"],
    avatar: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    evidence: ["application/pdf", "image/jpeg", "image/png"],
  },
} as const;
