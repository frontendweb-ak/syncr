// ─────────────────────────────────────────────────────────────────
// src/lib/email/providers/ses.client.ts
// ─────────────────────────────────────────────────────────────────
// AWS SES v2 SendEmail via REST + SigV4. Zero AWS SDK — Workers-compatible.
// SES pricing: $0.10/1,000 emails.
//
// Fixed from the original draft:
//   • send() no longer swallows fetch failures into a fake
//     { messageId: '' } success — that silently drops mail in
//     production, which contradicts the whole point of "throw
//     loudly, never drop." Errors now propagate as EmailSendError /
//     EmailTransientError.
//   • Added a request timeout (AbortController) — an unbounded fetch
//     to a stalled endpoint would otherwise hang the Worker.
//   • Added a small retry with backoff for retryable failures
//     (429 throttling, 5xx) — SES throttles hard at low sending
//     rates. Non-retryable 4xx (bad request, unverified sender)
//     fail immediately.
//   • Dropped the stray `User-Agent: 'undici-stream-example'` header
//     left over from a copy-pasted example — replaced with a real one.
// ─────────────────────────────────────────────────────────────────
import {
    EmailSendError,
    EmailTransientError,
    type SendEmailInput,
} from "../email.types";

export interface SesClientConfig {
  region: string; // e.g. 'ap-south-1' (Mumbai)
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string; // must be verified in SES console
  fromName?: string;
  replyTo?: string;
  configurationSetName?: string; // for bounce/complaint event tracking
  timeoutMs?: number; // default 10_000
  maxRetries?: number; // default 2 (3 attempts total)
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export class SesClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(private readonly cfg: SesClientConfig) {
    this.timeoutMs = cfg.timeoutMs ?? 10_000;
    this.maxRetries = cfg.maxRetries ?? 2;
  }

  async send(input: SendEmailInput): Promise<{ messageId: string }> {
    const toList = Array.isArray(input.to) ? input.to : [input.to];
    const fromAddress = this.cfg.fromName
      ? `${this.cfg.fromName} <${this.cfg.fromEmail}>`
      : this.cfg.fromEmail;

    const body = JSON.stringify({
      FromEmailAddress: fromAddress,
      Destination: {
        ToAddresses: toList,
        ...(input.cc?.length ? { CcAddresses: input.cc } : {}),
        ...(input.bcc?.length ? { BccAddresses: input.bcc } : {}),
      },
      ...(input.replyTo || this.cfg.replyTo
        ? { ReplyToAddresses: [input.replyTo ?? this.cfg.replyTo!] }
        : {}),
      Content: {
        Simple: {
          Subject: { Data: input.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: input.html, Charset: "UTF-8" },
            Text: { Data: input.text, Charset: "UTF-8" },
          },
        },
      },
      ...(this.cfg.configurationSetName
        ? { ConfigurationSetName: this.cfg.configurationSetName }
        : {}),
      ...(input.tags && Object.keys(input.tags).length > 0
        ? {
            EmailTags: Object.entries(input.tags).map(([Name, Value]) => ({
              Name,
              Value,
            })),
          }
        : {}),
    });

    return this.sendWithRetry(body);
  }

  private async sendWithRetry(body: string): Promise<{ messageId: string }> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.sendOnce(body);
      } catch (error) {
        lastError = error;
        const retryable = error instanceof EmailTransientError;
        const isLastAttempt = attempt === this.maxRetries;
        if (!retryable || isLastAttempt) throw error;

        // 250ms, 500ms, 1000ms... plus jitter, so a burst of retries
        // across concurrent requests doesn't sync up.
        const backoffMs = 250 * 2 ** attempt + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    // Unreachable, but keeps TS happy without a non-null assertion.
    throw lastError;
  }

  private async sendOnce(body: string): Promise<{ messageId: string }> {
    const endpoint = `https://email.${this.cfg.region}.amazonaws.com/v2/email/outbound-emails`;
    const url = new URL(endpoint);
    const now = new Date();
    const amzDate = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
    const dateStamp = amzDate.slice(0, 8);

    const { headers } = await this.signRequest({
      method: "POST",
      url,
      body,
      amzDate,
      dateStamp,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
    } catch (error) {
      // Network failure, DNS error, or our own timeout abort.
      throw new EmailTransientError(
        `SES request failed: ${error instanceof Error ? error.message : String(error)}`,
        "ses",
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errText = await response
        .text()
        .catch(() => String(response.status));
      const requestId = response.headers.get("x-amzn-requestid") ?? undefined;
      const message = `SES send failed (${response.status}): ${errText}`;

      if (RETRYABLE_STATUS.has(response.status)) {
        throw new EmailTransientError(
          message,
          "ses",
          response.status,
          requestId,
        );
      }
      throw new EmailSendError(message, "ses", response.status, requestId);
    }

    const result = (await response.json()) as { MessageId?: string };
    if (!result.MessageId) {
      // 2xx with no message id is not a state we should treat as
      // success — surface it instead of returning a hollow result.
      throw new EmailSendError(
        "SES returned 2xx without a MessageId",
        "ses",
        response.status,
      );
    }
    return { messageId: result.MessageId };
  }

  private async signRequest(opts: {
    method: string;
    url: URL;
    body: string;
    amzDate: string;
    dateStamp: string;
  }) {
    const { region } = this.cfg;
    const credScope = `${opts.dateStamp}/${region}/ses/aws4_request`;
    const payloadHash = await this.sha256Hex(opts.body ?? "");

    const canonicalHeaders =
      `content-type:application/json\n` +
      `host:${opts.url.host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${opts.amzDate}\n`;

    const signedHdrs = "content-type;host;x-amz-content-sha256;x-amz-date";
    const canonicalRequest = [
      opts.method,
      opts.url.pathname,
      "",
      canonicalHeaders,
      signedHdrs,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      opts.amzDate,
      credScope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = await this.deriveSigningKey(opts.dateStamp, region);
    const signature = await this.hmacHex(signingKey, stringToSign);

    return {
      headers: {
        "User-Agent": "syncr-mail/1.0 (+workers-fetch)",
        "Content-Type": "application/json",
        "X-Amz-Date": opts.amzDate,
        "X-Amz-Content-Sha256": payloadHash,
        Authorization:
          `AWS4-HMAC-SHA256 Credential=${this.cfg.accessKeyId}/${credScope}, ` +
          `SignedHeaders=${signedHdrs}, Signature=${signature}`,
      },
    };
  }

  private async sha256Hex(data: string): Promise<string> {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data),
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async hmacHex(key: ArrayBuffer, data: string): Promise<string> {
    const sig = await this.hmacBuf(key, data);
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async hmacBuf(
    key: ArrayBuffer | Uint8Array,
    data: string,
  ): Promise<ArrayBuffer> {
    const k = await crypto.subtle.importKey(
      "raw",
      this.toArrayBuffer(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    return crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  }

  private toArrayBuffer(key: ArrayBuffer | Uint8Array): ArrayBuffer {
    if (key instanceof ArrayBuffer) return key;
    return key.buffer.slice(
      key.byteOffset,
      key.byteOffset + key.byteLength,
    ) as ArrayBuffer;
  }

  private async deriveSigningKey(
    date: string,
    region: string,
  ): Promise<ArrayBuffer> {
    const enc = new TextEncoder();
    const kDate = await this.hmacBuf(
      enc.encode(`AWS4${this.cfg.secretAccessKey}`),
      date,
    );
    const kRegion = await this.hmacBuf(kDate, region);
    const kService = await this.hmacBuf(kRegion, "ses");
    return this.hmacBuf(kService, "aws4_request");
  }
}
