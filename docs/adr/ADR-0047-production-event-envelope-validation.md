# ADR-0047: Production Event Envelope Validation

## Status

* **Status:** Accepted
* **Date:** 2026-09-10

## Context

A production adapter can still produce malformed canonical envelopes because transport parsing, mapping, version handling, or implementation defects can fail. The runtime should not receive malformed envelopes merely because a source claims to emit the canonical contract.

## Decision

Add a small generic validation boundary in `@ci/runtime`:

- `assertValidEventEnvelope()` validates the structural fields required by `EventEnvelope`.
- `EventEnvelopeValidationError` identifies validation failures.
- `createRuntimeIngestionHandler()` validates before calling `Runtime.ingest()`.
- Accepted and rejected callbacks are optional application hooks for observation.
- Runtime and commerce semantics remain unchanged.

The validator checks only the generic envelope contract. Commerce-specific payload validation remains in `@ci/commerce`.

## Alternatives Considered

### Validate only inside each production adapter

Rejected. Every adapter would need to repeat the same generic contract validation.

### Put validation logic inside every Projection

Rejected. Projections should consume valid runtime events and should not become ingestion guards.

### Move commerce validation into runtime

Rejected. The generic runtime must not know commerce event types or payloads.

### Add a multi-stage normalization pipeline

Rejected. M5.1 deliberately kept the input boundary minimal, and there is no concrete requirement for additional pipeline abstractions yet.

## Consequences

Positive:

- malformed canonical envelopes are rejected before runtime state changes;
- generic validation is reusable across adapters;
- commerce-specific validation remains in the commerce package;
- application code has optional accepted/rejected observation hooks.

Negative:

- the structural validator cannot validate arbitrary payload semantics;
- source-specific validation remains the adapter's responsibility.

## Implementation Notes

Adds only generic envelope validation and an application-owned runtime ingestion handler. It does not add provider-specific infrastructure.

## Impact

The production path is now:

```text
External Source
    ↓
IngestionAdapter
    ↓
EventEnvelope
    ↓
RuntimeIngestionHandler
    ↓
Runtime.ingest()
```

Commerce-specific validation remains downstream of the generic runtime boundary where appropriate.
