# ADR-0049: Webhook Signature Verification

## Status

* **Status:** Accepted
* **Date:** 2026-09-10


## Context

The adapter already owns HTTP request handling, so request authentication belongs at the same boundary. The runtime must remain unaware of HTTP authentication details.

## Decision

`HttpWebhookAdapter` supports optional HMAC-SHA-256 signature verification over the exact raw request body.

The signature is read from `x-commerce-signature` by default and uses the format `sha256=<hex>`.

Verification happens before JSON parsing and before the ingestion handler is invoked.

When signature verification is not configured, the existing unsigned behavior remains available for local development or trusted internal transport.

## Alternatives Considered

### Framework-specific middleware

Rejected because it would couple the runtime package to a specific HTTP framework.

### Generic authentication pipeline

Rejected as unnecessary abstraction for the current single concrete HTTP adapter.

### Parsing JSON before verification

Rejected because the signature must cover the exact received body.

## Consequences

### Positive

- Forged webhook requests can be rejected at the adapter boundary.
- The runtime remains transport and authentication agnostic.
- The implementation uses platform Web Crypto APIs and introduces no dependency.

### Negative

- Signature conventions are adapter configuration, not a universal event contract.
- Providers with different signing schemes will require provider-specific adapter configuration or a later concrete adapter.

## Implementation Notes

The adapter returns `401` for missing or invalid signatures and does not invoke the ingestion handler.

The request body is read once as text, verified, and then parsed as JSON.

## Impact

`packages/runtime/src/input/http-webhook-adapter.ts` and its tests.
