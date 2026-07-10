// src/middleware/config.ts

import { createMiddleware } from 'hono/factory'

import type { AppConfig } from '../config'
import type { AppContext } from '../types/env'

export function createConfigMiddleware(config: AppConfig) {
  return createMiddleware<AppContext>(async (c, next) => {
    c.set('config', config)
    await next()
  })
}
