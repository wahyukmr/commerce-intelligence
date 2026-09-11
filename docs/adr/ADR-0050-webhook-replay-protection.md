# ADR-0050: Webhook Replay Protection

## Status

* **Status:** Accepted
* **Date:** 2026-09-10

## Context

The platform already performs event-ID deduplication in the runtime. That provides event processing idempotency but does not prevent an attacker or misconfigured sender from repeatedly delivering an old valid request to the HTTP boundary.

## Decision

Extend the existing HTTP webhook adapter with optional timestamp-based freshness verification.

When `timestampHeaderName` is configured, the adapter requires that header. When `maxAgeSeconds` is configured, the timestamp must fall inside the configured age window.

For timestamp-enabled signatures, the signed material is:

```text
<timestamp>.<raw request body>
```

Existing body-only HMAC signatures remain supported when timestamp options are omitted.

## Alternatives Considered

### Durable replay store
Rejected because it introduces persistence and operational infrastructure before a concrete deployment requires it.

### Request-ID cache in the adapter
Rejected because runtime event-ID deduplication already provides the correctness guarantee and a local cache would not survive process restarts.

### Replace the runtime deduplication mechanism
Rejected because the runtime is intentionally the source of truth for event processing semantics.

## Consequences

Webhook deployments can opt into a bounded freshness window without adding a database or queue.

Timestamp-protected webhooks require senders to change their signing input.

Timestamp freshness is process-independent because the check uses the request timestamp and wall clock, but it is not a substitute for durable event idempotency.

## Implementation Notes

The adapter validates freshness before JSON parsing and before invoking the ingestion handler.

A timestamp outside the configured window produces HTTP 408. Invalid or missing authentication data produces HTTP 401.

## Impact

No changes to runtime core execution APIs are required.
