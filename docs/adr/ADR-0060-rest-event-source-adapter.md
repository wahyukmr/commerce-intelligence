# ADR-0060 — REST Event Source Adapter

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
The runtime already accepts canonical `EventEnvelope` values through the ingestion boundary. Production commerce systems may expose event data through REST endpoints. The platform needs one concrete pull adapter without coupling the runtime to a specific framework, HTTP client, or commerce vendor.

## Decision
Add a generic `HttpRestEventSourceAdapter` to `@ci/runtime` and a thin commerce composition in `@ci/commerce`.

The runtime adapter owns HTTP polling mechanics. The commerce package owns the mapping from a commerce REST record to `EventEnvelope`.

The adapter supports explicit `pull()` plus optional interval-driven polling through `start()`.

`start()` begins interval scheduling but does not perform an implicit pull. Hosts may call `pull()` explicitly when they need deterministic startup behavior.

## Alternatives Considered

### Add a vendor-specific REST adapter directly
Rejected because vendor selection is not yet a product requirement.

### Add a queue adapter at the same time
Rejected because it would introduce another transport boundary without a concrete requirement.

### Put HTTP polling inside `Runtime`
Rejected because Runtime must remain transport agnostic.

## Consequences

Positive:
- A real production input source now exists.
- HTTP concerns remain outside Runtime.
- Commerce mapping remains outside generic Runtime.
- Cursor-based polling is supported.
- The adapter can be reused with different REST providers.

Negative:
- Polling still depends on source API semantics such as cursor consistency.
- Persistence of the provider cursor is delegated to the optional `RestEventCursorStore` contract; durable implementations remain outside the runtime package.

## Implementation Notes
The adapter expects a JSON response with `events` and an optional `cursor` by default. Provider-specific response parsing can be supplied through the existing parser option instead of adding a provider hierarchy.

## Impact
Impacts `@ci/runtime` input adapters and `@ci/commerce` REST adapter composition.

