// src/core/http/request.ts

import type { Context } from 'hono'
import { Errors } from '../../errors'
import type { AppContext } from '../../types/env'

export function requireParam(c: Context<AppContext>, name: string): string {
  const value = c.req.param(name)
  if (!value) throw Errors.validation.invalidParam(name)
  return value
}

export function requireUserId(c: Context<AppContext>): string {
  const auth = c.get('auth')
  if (!auth) throw Errors.auth.tokenMissing()
  return auth.sub
}
