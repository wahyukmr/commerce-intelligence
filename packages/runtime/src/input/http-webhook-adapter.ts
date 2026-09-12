/// <reference lib="dom" />

import type { EventEnvelope } from "../contracts/event";
import {
  assertBodySize,
  assertContentType,
  assertRequestHeaders,
  validateWebhookSecurityOptions,
  WebhookSecurityError,
  type WebhookSecurityOptions,
} from "../security/index";
import type { IngestionAdapter, IngestionEventHandler } from "./ingestion-adapter";

export interface HttpWebhookSignatureOptions {
  readonly secret: string;
  readonly headerName?: string;
  readonly algorithm?: "SHA-256";
  readonly timestampHeaderName?: string;
  readonly maxAgeSeconds?: number;
}

export interface HttpWebhookAdapterOptions {
  readonly name?: string;
  readonly method?: string;
  readonly path?: string;
  readonly signature?: HttpWebhookSignatureOptions;
  readonly security?: WebhookSecurityOptions;
}

export interface HttpWebhookResponse {
  readonly status: number;
  readonly body: unknown;
}

export class HttpWebhookAdapter implements IngestionAdapter {
  public readonly name: string;

  private readonly method: string;
  private readonly path: string | undefined;
  private readonly signature: HttpWebhookSignatureOptions | undefined;
  private readonly security: WebhookSecurityOptions | undefined;
  private handler: IngestionEventHandler | undefined;
  private started = false;

  constructor(options: HttpWebhookAdapterOptions = {}) {
    this.name = options.name ?? "http-webhook";
    this.method = (options.method ?? "POST").toUpperCase();
    this.path = options.path;
    this.signature = options.signature;
    this.security = options.security;

    validateSignatureOptions(this.signature);
    validateWebhookSecurityOptions(this.security);
  }

  public start(handler: IngestionEventHandler): void {
    if (this.started) {
      throw new Error("HTTP webhook adapter already started");
    }

    this.handler = handler;
    this.started = true;
  }

  public stop(): void {
    this.handler = undefined;
    this.started = false;
  }

  public async handle(request: Request): Promise<HttpWebhookResponse> {
    if (!this.started || !this.handler) {
      return { status: 503, body: { error: "HTTP webhook adapter is not started" } };
    }

    if (request.method.toUpperCase() !== this.method) {
      return { status: 405, body: { error: "Method not allowed" } };
    }

    if (this.path && new URL(request.url).pathname !== this.path) {
      return { status: 404, body: { error: "Not found" } };
    }

    try {
      assertRequestHeaders(request, this.security);
      assertContentType(request, this.security);
    } catch (error) {
      if (error instanceof WebhookSecurityError) {
        return {
          status: error.status,
          body: { error: error.message },
        };
      }

      throw error;
    }

    const contentType = request.headers.get("content-type") ?? "";

    const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase();

    if (mediaType !== "application/json") {
      return { status: 415, body: { error: "Content-Type must be application/json" } };
    }

    let body: string;

    try {
      body = await request.text();
      assertBodySize(body, this.security);
    } catch (error) {
      if (error instanceof WebhookSecurityError) {
        return {
          status: error.status,
          body: { error: error.message },
        };
      }

      return { status: 400, body: { error: "Unable to read request body" } };
    }

    if (this.signature) {
      const verification = await verifyWebhookSignature(request, body, this.signature);

      if (!verification.valid) {
        return { status: verification.status, body: { error: verification.error } };
      }
    }

    let event: EventEnvelope;
    try {
      event = parseEvent(JSON.parse(body));
    } catch {
      return {
        status: 400,
        body: { error: "Request body must contain a valid JSON event envelope" },
      };
    }

    try {
      const outcome = await this.handler(event);

      return {
        status: 202,
        body: {
          accepted: outcome.status === "accepted",
          duplicate: outcome.status === "duplicate",
          eventId: event.id,
          outcome: outcome.status,
        },
      };
    } catch {
      return {
        status: 422,
        body: { error: "Event ingestion failed" },
      };
    }
  }
}

interface SignatureVerificationResult {
  readonly valid: true;
}

interface SignatureVerificationFailure {
  readonly valid: false;
  readonly status: 401 | 408;
  readonly error: string;
}

async function verifyWebhookSignature(
  request: Request,
  body: string,
  options: HttpWebhookSignatureOptions,
): Promise<SignatureVerificationResult | SignatureVerificationFailure> {
  const providedSignature = request.headers.get(options.headerName ?? "x-commerce-signature");

  if (!providedSignature) {
    return { valid: false, status: 401, error: "Missing webhook signature" };
  }

  const timestampHeaderName = options.timestampHeaderName;
  const timestamp = timestampHeaderName ? request.headers.get(timestampHeaderName) : undefined;

  if (timestampHeaderName && !timestamp) {
    return { valid: false, status: 401, error: "Missing webhook timestamp" };
  }

  if (timestamp && options.maxAgeSeconds !== undefined) {
    const timestampMs = parseWebhookTimestamp(timestamp);

    if (timestampMs === undefined) {
      return { valid: false, status: 401, error: "Invalid webhook timestamp" };
    }

    if (!isTimestampFresh(timestampMs, options.maxAgeSeconds)) {
      return {
        valid: false,
        status: 408,
        error: "Webhook timestamp is outside the allowed age window",
      };
    }
  }

  const signedPayload = timestamp ? `${timestamp}.${body}` : body;
  const valid = await verifyHmacSha256(signedPayload, providedSignature, options.secret);

  if (!valid) {
    return { valid: false, status: 401, error: "Invalid webhook signature" };
  }

  return { valid: true };
}

function validateSignatureOptions(options: HttpWebhookSignatureOptions | undefined): void {
  if (!options) return;

  if (options.secret.trim().length === 0) {
    throw new Error("Webhook signature secret must be non-empty");
  }

  if (
    options.maxAgeSeconds !== undefined &&
    (!Number.isFinite(options.maxAgeSeconds) || options.maxAgeSeconds <= 0)
  ) {
    throw new Error("Webhook signature maxAgeSeconds must be greater than zero");
  }

  if (options.maxAgeSeconds !== undefined && !options.timestampHeaderName) {
    throw new Error(
      "Webhook signature timestampHeaderName is required when maxAgeSeconds is configured",
    );
  }
}

function parseWebhookTimestamp(value: string): number | undefined {
  const normalized = value.trim();

  if (/^\d+$/.test(normalized)) {
    const numericValue = Number(normalized);
    const milliseconds = normalized.length <= 10 ? numericValue * 1000 : numericValue;
    return Number.isFinite(milliseconds) ? milliseconds : undefined;
  }

  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function isTimestampFresh(timestampMs: number, maxAgeSeconds: number): boolean {
  const ageMs = Math.abs(Date.now() - timestampMs);
  return ageMs <= maxAgeSeconds * 1000;
}

async function verifyHmacSha256(
  payload: string,
  providedSignature: string,
  secret: string,
): Promise<boolean> {
  const normalizedSignature = providedSignature.trim();
  const expectedPrefix = "sha256=";

  if (!normalizedSignature.toLowerCase().startsWith(expectedPrefix)) {
    return false;
  }

  const providedHex = normalizedSignature.slice(expectedPrefix.length);

  if (!/^[0-9a-f]+$/i.test(providedHex) || providedHex.length % 2 !== 0) {
    return false;
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(payload));

  const expectedHex = bytesToHex(new Uint8Array(signature));
  return timingSafeEqual(providedHex.toLowerCase(), expectedHex);
}

function parseEvent(value: unknown): EventEnvelope {
  if (!value || typeof value !== "object") {
    throw new Error("Event must be an object");
  }

  return value as EventEnvelope;
}

function bytesToHex(bytes: Uint8Array): string {
  let result = "";

  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }

  return result;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}
