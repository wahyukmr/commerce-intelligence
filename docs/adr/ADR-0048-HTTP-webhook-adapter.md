# ADR-0048 — First Concrete Production Ingestion Adapter: HTTP Webhook

## Status

* **Status:** Accepted
* **Date:** 2026-09-10

## Context

The platform now needs one concrete production-facing transport adapter to prove that the boundary is usable without coupling the runtime to a server framework.

No vendor-specific webhook contract has been selected yet. A concrete adapter should therefore implement transport behavior without pretending to normalize an unknown vendor schema.

## Decision

Implement `HttpWebhookAdapter` in `@ci/runtime` using the Web standard `Request` type.

The adapter accepts a canonical JSON `EventEnvelope`, delegates the event to the injected `IngestionEventHandler`, and maps lifecycle/protocol failures to simple HTTP response data.

The adapter does not:

- validate commerce semantics;
- call `Runtime` directly;
- know about a web framework;
- implement retries, queues, signatures, rate limiting, or vendor-specific payload mappings.

Those concerns belong to the application/transport integration or future concrete provider adapters.

## Alternatives Considered

### Express adapter
Rejected because it would couple the runtime package to one HTTP framework.

### Fastify/Hono/Next.js adapter
Rejected for the same reason and because no server framework is part of the locked architecture.

### Vendor-specific webhook adapter
Deferred until a real provider contract is selected.

## Consequences

The project now has a real production-shaped input path while retaining transport independence.

The canonical envelope assumption is explicit. A future vendor adapter can map its external payload into the same `EventEnvelope` before invoking the shared ingestion handler.

## Implementation Notes

The application owns the server route and passes the Web `Request` to `HttpWebhookAdapter.handle()`.

## Impact

This establishes the first concrete production adapter without changing runtime projections, queries, or dashboard contracts.
