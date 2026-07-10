// src/core/context/service-context.ts

import type { Logger } from 'pino'
import type { AppConfig } from '../../config'
import type { AccessTokenPayload, JwtService } from '../../lib/jwt'
import type { RepoContext } from '../base/base.repo'

export interface ServiceContext {
  db: RepoContext
  logger: Logger
  config: AppConfig
  jwt: JwtService
  requestId: string
  auth?: AccessTokenPayload
  ip?: string
  userAgent?: string
}
