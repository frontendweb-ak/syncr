// src/core/http/response.ts
//
// Success response envelope, mirroring the shape errors/handler.ts already
// uses for error responses:
//
//   { success: false, error: {...}, meta: { requestId, timestamp } }
//
// so a client can always branch on `success` and get a consistently
// shaped object either way.

import type { PaginationMeta, ResponseMeta } from "@syncr/types";




export function buildMeta(requestId: string): ResponseMeta {
  return { requestId, timestamp: new Date().toISOString() }
}

export function buildPaginationMeta(
  requestId: string,
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  return {
    ...buildMeta(requestId),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
