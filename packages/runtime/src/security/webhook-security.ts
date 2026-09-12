export interface WebhookSecurityOptions {
  readonly maxBodyBytes?: number;
  readonly allowedContentTypes?: readonly string[];
  readonly requiredHeaders?: readonly string[];
}

export class WebhookSecurityError extends Error {
  public readonly status: 400 | 403 | 413 | 415;

  public constructor(message: string, status: 400 | 403 | 413 | 415) {
    super(message);
    this.name = "WebhookSecurityError";
    this.status = status;
  }
}

export function validateWebhookSecurityOptions(options: WebhookSecurityOptions | undefined): void {
  if (!options) {
    return;
  }

  if (
    options.maxBodyBytes !== undefined &&
    (!Number.isInteger(options.maxBodyBytes) || options.maxBodyBytes <= 0)
  ) {
    throw new Error("maxBodyBytes must be a positive integer");
  }

  if (options.allowedContentTypes?.some((value) => value.trim().length === 0)) {
    throw new Error("allowedContentTypes cannot contain empty values");
  }

  if (options.requiredHeaders?.some((value) => value.trim().length === 0)) {
    throw new Error("requiredHeaders cannot contain empty values");
  }
}

export function assertRequestHeaders(
  request: Request,
  options: WebhookSecurityOptions | undefined,
): void {
  if (!options?.requiredHeaders) {
    return;
  }

  for (const headerName of options.requiredHeaders) {
    if (!request.headers.has(headerName)) {
      throw new WebhookSecurityError(`Missing required request header: ${headerName}`, 403);
    }
  }
}

export function assertContentType(
  request: Request,
  options: WebhookSecurityOptions | undefined,
): void {
  if (!options?.allowedContentTypes?.length) {
    return;
  }

  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase();

  const allowed = options.allowedContentTypes.some(
    (candidate) => candidate.trim().toLowerCase() === mediaType,
  );

  if (!allowed) {
    throw new WebhookSecurityError("Request Content-Type is not allowed", 415);
  }
}

export function assertBodySize(body: string, options: WebhookSecurityOptions | undefined): void {
  if (options?.maxBodyBytes === undefined) {
    return;
  }

  const size = new TextEncoder().encode(body).byteLength;

  if (size > options.maxBodyBytes) {
    throw new WebhookSecurityError("Request body exceeds the configured size limit", 413);
  }
}
