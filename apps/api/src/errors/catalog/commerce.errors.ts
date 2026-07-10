// ─────────────────────────────────────────────────────────────────
// errors/catalog/commerce.errors.ts
// Domains: checkout · payment
// ─────────────────────────────────────────────────────────────────
import { BadRequestException } from '../bad-request.error'
import { ErrorCode } from '../codes'
import { ConflictException } from '../conflict.error'
import { HttpException } from '../exceptions'
import { ForbiddenException } from '../forbidden.error'
import { NotFoundException } from '../not-found.error'

export const commerceErrors = {
  checkout: {
    notFound: () => new NotFoundException('Checkout', ErrorCode.CHECKOUT_NOT_FOUND),
    alreadyCompleted: () =>
      new BadRequestException(
        'This checkout has already been completed',
        ErrorCode.CHECKOUT_ALREADY_COMPLETED,
      ),
    expired: () =>
      new BadRequestException(
        'This checkout session has expired',
        ErrorCode.CHECKOUT_EXPIRED,
      ),
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

  payment: {
    notFound: () => new NotFoundException('Payment', ErrorCode.PAYMENT_NOT_FOUND),
    invalidAmount: () =>
      new HttpException(
        400,
        ErrorCode.PAYMENT_AMOUNT_MISMATCH,
        'Payment amount does not match the expected amount',
      ),
    failed: (msg = 'Payment failed') =>
      new HttpException(502, ErrorCode.PAYMENT_FAILED, msg),
    alreadyCaptured: () =>
      new ConflictException(
        'Payment already captured',
        ErrorCode.PAYMENT_ALREADY_CAPTURED,
      ),
    gatewayError: (msg = 'Payment gateway error') =>
      new HttpException(502, ErrorCode.PAYMENT_GATEWAY_ERROR, msg),
    escrowNotHeld: () =>
      new BadRequestException(
        'Funds are not currently held in escrow',
        ErrorCode.ESCROW_NOT_HELD,
      ),
    refundFailed: (msg = 'Refund failed') =>
      new HttpException(502, ErrorCode.REFUND_FAILED, msg),
    payoutFailed: (msg = 'Payout failed') =>
      new HttpException(502, ErrorCode.PAYOUT_FAILED, msg),
  },
} as const