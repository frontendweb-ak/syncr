// src/core/http/pagination.ts

import type { Context } from 'hono'

import { PLATFORM } from '../../config/constants'
import type { AppContext } from '../../types/env'

export interface PaginationParams {
  page: number
  pageSize: number
  offset: number
}

/**
 * Reads ?page=&pageSize= from the query string, clamping pageSize to
 * PLATFORM.PAGE_SIZE_MAX so a client can never request an unbounded
 * result set (a common source of accidental full-table scans). Invalid
 * or missing values fall back to sane defaults rather than erroring —
 * pagination params are a UX nicety, not something worth rejecting a
 * request over.
 */
export function getPaginationParams(c: Context<AppContext>): PaginationParams {
  const rawPage = Number.parseInt(c.req.query('page') ?? '1', 10)
  const rawPageSize = Number.parseInt(
    c.req.query('pageSize') ?? String(PLATFORM.PAGE_SIZE_DEFAULT),
    10,
  )

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, PLATFORM.PAGE_SIZE_MAX)
      : PLATFORM.PAGE_SIZE_DEFAULT

  return { page, pageSize, offset: (page - 1) * pageSize }
}
