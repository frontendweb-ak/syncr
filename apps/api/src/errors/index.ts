import { BadRequestException } from './bad-request.error'
import { ErrorCode } from './codes'
import { ConflictException } from './conflict.error'
import { HttpException } from './exceptions'
import { ForbiddenException } from './forbidden.error'
import { NotFoundException } from './not-found.error'
import { RateLimitException } from './rate-limit.error'
import { ServiceUnavailableException } from './service-unavailable.error'
import { UnauthorizedException } from './un-authrized-error.error'

export * from './handler'
export const Errors = {
  auth: {
    tokenMissing: () =>
      new UnauthorizedException('Missing or malformed token', ErrorCode.AUTH_TOKEN_MISSING),
    accountLocked: () =>
      new ForbiddenException(
        'Account temporarily locked due to too many failed attempts',
        ErrorCode.AUTH_ACCOUNT_LOCKED,
      ),
    mustResetPassword: () =>
      new UnauthorizedException(
        'You must reset your password before continuing',
        ErrorCode.AUTH_MUST_RESET_PASSWORD,
      ),
    tokenInvalid: () => new UnauthorizedException('Invalid token', ErrorCode.AUTH_TOKEN_INVALID),

    tokenExpired: () =>
      new UnauthorizedException('Token has expired', ErrorCode.AUTH_TOKEN_EXPIRED),

    otpInvalid: () => new BadRequestException('Invalid OTP', ErrorCode.AUTH_OTP_INVALID),

    otpExpired: () =>
      new BadRequestException('OTP has expired. Request a new one.', ErrorCode.AUTH_OTP_EXPIRED),
    otpRateLimit: () => new RateLimitException('Too many OTP requests'),

    otpCreateFailed: () =>
      new HttpException(500, ErrorCode.AUTH_OTP_CREATE_FAILED, 'Failed to generate OTP'),

    otpDeliveryFailed: () =>
      new HttpException(
        502,
        ErrorCode.AUTH_OTP_DELIVERY_FAILED,
        'Unable to deliver OTP. Please try again.',
      ),

    otpDeliveryUnavailable: () =>
      new ServiceUnavailableException('OTP delivery is currently unavailable'),

    roleForbidden: (role: string) =>
      new ForbiddenException(`This action requires role: ${role}`, ErrorCode.AUTH_ROLE_FORBIDDEN),

    permissionDenied: (permission: string) =>
      new ForbiddenException(`Missing permission: ${permission}`, ErrorCode.AUTH_PERMISSION_DENIED),

    passwordTooWeak: (reason: string) =>
      new HttpException(422, ErrorCode.AUTH_PASSWORD_TOO_WEAK, reason),

    passwordRequired: () =>
      new BadRequestException(
        'This account does not have a password set',
        ErrorCode.AUTH_PASSWORD_REQUIRED,
      ),
    resetTokenInvalid: () =>
      new BadRequestException(
        'Reset link or code is invalid or has expired',
        ErrorCode.AUTH_RESET_TOKEN_INVALID,
      ),
    currentPasswordInvalid: () =>
      new BadRequestException(
        'Current password is incorrect',
        ErrorCode.AUTH_CURRENT_PASSWORD_INVALID,
      ),
    invalidCredentials: () =>
      new UnauthorizedException('Invalid credentials', ErrorCode.AUTH_INVALID_CREDENTIALS),
    roleRequired: () =>
      new BadRequestException(
        'Role is required for first registration',
        ErrorCode.AUTH_ROLE_REQUIRED,
      ),
    oauthUnavailable: () =>
      new UnauthorizedException('Google sign-in is currently unavailable. Please try again later.'),
    oauthTokenInvalid: () => new UnauthorizedException('Invalid or expired Google sign-in token.'),
    passwordAlreadySet: () =>
      new ConflictException('A password has already been configured for this account.'),

    providerAlreadyLinked: () =>
      new ConflictException('This provider is already linked to an account.'),
    emailAlreadyExists: () => new ConflictException('Email already existed.'),
  },

  user: {
    notFound: () => new NotFoundException('User', ErrorCode.USER_NOT_FOUND),
    onboardingIncomplete: () => new BadRequestException(ErrorCode.ONBOARDING_INCOMPLETE),
    createFailed: () =>
      new HttpException(500, ErrorCode.USER_CREATE_FAILED, 'Failed to create user'),

    alreadyExists: () =>
      new ConflictException('User already exists', ErrorCode.USER_ALREADY_EXISTS),

    emailAlreadyExists: () =>
      new ConflictException('Email already exists', ErrorCode.USER_EMAIL_ALREADY_EXISTS),

    phoneAlreadyExists: () =>
      new ConflictException('Phone already exists', ErrorCode.USER_PHONE_ALREADY_EXISTS),

    inactive: () => new ForbiddenException('User account is inactive', ErrorCode.USER_INACTIVE),

    invalidAuthProvider: () =>
      new BadRequestException(
        'Invalid authentication provider or provider ID',
        ErrorCode.AUTH_INVALID_PROVIDER,
      ),
  },

  device: {
    notFound: () => new NotFoundException('Device', ErrorCode.DEVICE_NOT_FOUND),

    fingerprintRequired: () =>
      new BadRequestException(
        'Device fingerprint is required',
        ErrorCode.DEVICE_FINGERPRINT_REQUIRED,
      ),
    revoked: () =>
      new UnauthorizedException('Device has been revoked', ErrorCode.AUTH_DEVICE_REVOKED),

    expired: () =>
      new UnauthorizedException('Device session has expired', ErrorCode.AUTH_DEVICE_EXPIRED),

    createFailed: () =>
      new HttpException(500, ErrorCode.DEVICE_CREATE_FAILED, 'Failed to register device'),

    alreadyExists: () =>
      new ConflictException('Device already registered', ErrorCode.DEVICE_ALREADY_EXISTS),

    limitExceeded: (limit: number) =>
      new ConflictException(
        `Maximum ${limit} active devices allowed`,
        ErrorCode.DEVICE_LIMIT_EXCEEDED,
      ),
  },

  profile: {
    incomplete: () =>
      new BadRequestException(
        'Complete your profile before continuing.',
        ErrorCode.PROFILE_INCOMPLETE,
      ),
  },

  validation: {
    invalidParam: (detail: string) =>
      new BadRequestException(`Invalid parameter: ${detail}`, ErrorCode.INVALID_PARAM),
    missingField: (field: string) =>
      new BadRequestException(`Missing required field: ${field}`, ErrorCode.MISSING_FIELD),
  },

  checkout: {
    notFound: () => new NotFoundException('Checkout', ErrorCode.CHECKOUT_NOT_FOUND),
    alreadyCompleted: () =>
      new BadRequestException(
        'This checkout has already been completed',
        ErrorCode.CHECKOUT_ALREADY_COMPLETED,
      ),
    expired: () =>
      new BadRequestException('This checkout session has expired', ErrorCode.CHECKOUT_EXPIRED),
    accessDenied: () =>
      new ForbiddenException(
        'You do not have access to this checkout',
        ErrorCode.CHECKOUT_ACCESS_DENIED,
      ),
    programmeNotPublished: () =>
      new BadRequestException(
        'Programme is not available for purchase',
        ErrorCode.CHECKOUT_PROGRAMME_NOT_PUBLISHED,
      ),
    duplicate: () =>
      new ConflictException(
        'An active checkout already exists for this programme',
        ErrorCode.CHECKOUT_DUPLICATE,
      ),
  },

  student: {
    notFound: () => new NotFoundException('Student profile', ErrorCode.STUDENT_NOT_FOUND),
    createFailed: () =>
      new HttpException(500, ErrorCode.STUDENT_CREATE_FAILED, 'Failed to create student profile'),
    profileExists: () =>
      new ConflictException('Student profile already exists', ErrorCode.STUDENT_PROFILE_EXISTS),
    requirementNotFound: () =>
      new NotFoundException('Requirement', ErrorCode.STUDENT_REQUIREMENT_NOT_FOUND),
    requirementClosed: () =>
      new BadRequestException(
        'This requirement is already closed',
        ErrorCode.STUDENT_REQUIREMENT_CLOSED,
      ),
  },
  mentor: {
    notFound: () => new NotFoundException('Mentor', ErrorCode.MENTOR_NOT_FOUND),

    notVerified: () =>
      new ForbiddenException('Mentor is not yet verified', ErrorCode.MENTOR_NOT_VERIFIED),

    notActive: () =>
      new ForbiddenException('Mentor is not accepting students', ErrorCode.MENTOR_NOT_ACTIVE),

    capacityFull: () =>
      new ConflictException('Mentor has no available slots', ErrorCode.MENTOR_CAPACITY_FULL),

    alreadyApproved: () =>
      new ConflictException('Mentor is already approved', ErrorCode.MENTOR_ALREADY_APPROVED),
  },

  programme: {
    notFound: () => new NotFoundException('Programme', ErrorCode.PROGRAMME_NOT_FOUND),

    notPublished: () =>
      new BadRequestException('Programme is not published', ErrorCode.PROGRAMME_NOT_PUBLISHED),

    tierExists: () =>
      new ConflictException(
        'A programme for this tier already exists',
        ErrorCode.PROGRAMME_TIER_EXISTS,
      ),
  },

  requirement: {
    notFound: () => new NotFoundException('Requirement', ErrorCode.REQUIREMENT_NOT_FOUND),

    closed: () =>
      new ConflictException('Requirement is no longer open', ErrorCode.REQUIREMENT_CLOSED),
  },

  application: {
    duplicate: () =>
      new ConflictException(
        'You have already applied to this requirement',
        ErrorCode.APPLICATION_DUPLICATE,
      ),
  },

  mentorship: {
    notFound: () => new NotFoundException('Mentorship', ErrorCode.MENTORSHIP_NOT_FOUND),

    notActive: () =>
      new BadRequestException('Mentorship is not active', ErrorCode.MENTORSHIP_NOT_ACTIVE),

    duplicate: () =>
      new ConflictException(
        'You already have an active mentorship with this mentor',
        ErrorCode.MENTORSHIP_DUPLICATE,
      ),

    accessDenied: () =>
      new ForbiddenException(
        'You are not a party to this mentorship',
        ErrorCode.MENTORSHIP_ACCESS_DENIED,
      ),
  },

  submission: {
    alreadyEvaluated: () =>
      new ConflictException(
        'This submission has already been evaluated',
        ErrorCode.SUBMISSION_ALREADY_EVALUATED,
      ),
  },

  payment: {
    notFound: () => new NotFoundException('Payment', ErrorCode.PAYMENT_NOT_FOUND),
    invalidAmount: () =>
      new HttpException(400, ErrorCode.PAYMENT_AMOUNT_MISMATCH, 'Payment amount mismatch.'),
    failed: (msg: string) => new HttpException(502, ErrorCode.PAYMENT_FAILED, msg),
    alreadyCaptured: () =>
      new ConflictException('Payment already captured', ErrorCode.PAYMENT_ALREADY_CAPTURED),
    gatewayError: (msg: string) => new HttpException(502, ErrorCode.PAYMENT_GATEWAY_ERROR, msg),
  },

  upload: {
    fileTooLarge: (maxMb: number) =>
      new BadRequestException(`File exceeds the ${maxMb} MB limit`, ErrorCode.FILE_TOO_LARGE),
    fileTypeNotAllowed: () =>
      new BadRequestException('File type not allowed', ErrorCode.FILE_TYPE_NOT_ALLOWED),
  },
  session: {
    notFound: () => new NotFoundException('Session', ErrorCode.SESSION_NOT_FOUND),
    notScheduled: () =>
      new BadRequestException(
        'Session is not in a scheduled state',
        ErrorCode.SESSION_NOT_SCHEDULED,
      ),
    alreadyCompleted: () =>
      new BadRequestException(
        'Session has already been completed',
        ErrorCode.SESSION_ALREADY_COMPLETED,
      ),
    accessDenied: () =>
      new ForbiddenException(
        'You do not have access to this session',
        ErrorCode.SESSION_ACCESS_DENIED,
      ),
  },

  review: {
    notFound: () => new NotFoundException('Review', ErrorCode.REVIEW_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        'You have already reviewed this mentorship',
        ErrorCode.REVIEW_ALREADY_EXISTS,
      ),
    accessDenied: () =>
      new ForbiddenException(
        'You do not have access to this review',
        ErrorCode.REVIEW_ACCESS_DENIED,
      ),
    mentorshipNotComplete: () =>
      new BadRequestException(
        'You can only review a completed mentorship',
        ErrorCode.REVIEW_MENTORSHIP_NOT_COMPLETE,
      ),
  },

  dispute: {
    notFound: () => new NotFoundException('Dispute', ErrorCode.DISPUTE_NOT_FOUND),
    alreadyClosed: () =>
      new BadRequestException('This dispute is already closed', ErrorCode.DISPUTE_ALREADY_CLOSED),
  },
} as const
