import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { AppContext } from "../../types/env";
import {
  buildMeta,
  buildPaginationMeta,
  type PaginatedResponse,
  type SuccessResponse,
} from "../http/response";

function getRequestId(c: Context<AppContext>): string {
  // requestId() middleware (hono/request-id) sets this — see app.ts. Falls
  // back to the header or "unknown" rather than throwing so a response can
  // still be sent even if that middleware was somehow skipped.
  return c.get("requestId") ?? c.req.header("X-Request-Id") ?? "unknown";
}

export function ok<T>(
  c: Context<AppContext>,
  data: T,
  status: ContentfulStatusCode = 200,
) {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    meta: buildMeta(getRequestId(c)),
  };
  return c.json(body, status);
}

export function created<T>(c: Context<AppContext>, data: T) {
  return ok(c, data, 201);
}

export function noContent(c: Context<AppContext>) {
  return c.body(null, 204);
}

export function paginated<T>(
  c: Context<AppContext>,
  items: T[],
  page: number,
  pageSize: number,
  total: number,
) {
  const body: PaginatedResponse<T> = {
    success: true,
    data: items,
    meta: buildPaginationMeta(getRequestId(c), page, pageSize, total),
  };
  return c.json(body, 200);
}

export abstract class BaseController {
  protected ok = ok;
  protected created = created;
  protected noContent = noContent;
  protected paginated = paginated;
}
