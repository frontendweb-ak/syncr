import { Hono } from 'hono'

import type { AppContext } from '../../types/env'
import { healthController } from './health.controller'

export const healthRoutes = new Hono<AppContext>()

healthRoutes.get('/', healthController.get)
