// src/modules/auth/oauth/google.service.ts

import { createRemoteJWKSet, errors as JoseErrors, jwtVerify } from 'jose'
import { type AppConfig, PLATFORM } from '../../../config'
import { Errors } from '../../../errors'

const GOOGLE_JWKS_URL = PLATFORM.google.GOOGLE_JWKS_URL
const GOOGLE_ISSUER = PLATFORM.google.GOOGLE_ISSUERS
const googleJwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL))

export interface GoogleIdentity {
  /** Stable Google account identifier */
  subject: string
  email: string
  emailVerified: boolean
  name?: string
  pictureUrl?: string
}

export class GoogleOAuthService {
  constructor(private readonly config: AppConfig) {}

  async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    const audience = this.config.GOOGLE_CLIENT_ID

    if (!audience) {
      throw Errors.auth.oauthUnavailable()
    }

    let payload: Awaited<ReturnType<typeof jwtVerify>>['payload']

    try {
      const { payload: verifiedPayload } = await jwtVerify(idToken, googleJwks, {
        issuer: [...GOOGLE_ISSUER],
        audience,
      })

      payload = verifiedPayload
    } catch (error) {
      if (
        error instanceof JoseErrors.JWTExpired ||
        error instanceof JoseErrors.JWTInvalid ||
        error instanceof JoseErrors.JWTClaimValidationFailed ||
        error instanceof JoseErrors.JWSSignatureVerificationFailed
      ) {
        throw Errors.auth.oauthTokenInvalid()
      }

      throw error
    }

    const { sub, email, email_verified, name, picture } = payload

    if (typeof sub !== 'string' || typeof email !== 'string') {
      throw Errors.auth.oauthTokenInvalid()
    }

    const identity: GoogleIdentity = {
      subject: sub,
      email: email.toLowerCase(),
      emailVerified: email_verified === true,
    }

    if (typeof name === 'string') {
      identity.name = name
    }

    if (typeof picture === 'string') {
      identity.pictureUrl = picture
    }

    return identity
  }
}
