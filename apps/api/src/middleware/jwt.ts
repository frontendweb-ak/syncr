import { createMiddleware } from 'hono/factory'
import type { JwtService } from '../lib/jwt'
export const jwtMiddleware = (jwt: JwtService) =>
  createMiddleware(async (c, next) => {
    c.set('jwt', jwt)

    await next()
  })
