# ADR-0053 — Ingestion Acknowledgement Semantics

## Status

* **Status:** Accepted
* **Date:** 2026-09-11


## Context

The production ingestion path now validates, authenticates, and forwards events to the runtime. The boundary needs an explicit success signal so an HTTP host can distinguish an accepted event from a request that was merely parsed.

A transport-level response must not imply durable persistence because no durable event store or queue has been selected yet.

## Decision

The runtime ingestion handler returns an `IngestionOutcome` after successful `Runtime.ingest()` completion.

The outcome identifies the event and tenant, reports `accepted` or `duplicate`, and records the receipt time. The HTTP webhook adapter maps that outcome to HTTP `202`.

The outcome represents successful runtime acceptance only. It does not represent durable persistence.

## Alternatives Considered

### Return `void`

Rejected because hosts cannot distinguish successful ingestion from a transport-level return without inventing their own success semantics.

### Add a durable queue now

Rejected because no infrastructure target has been selected and a queue would prematurely constrain deployment architecture.

### Add a generic event delivery state machine

Rejected as unnecessary. The current boundary needs only a concrete ingestion outcome.

## Consequences

Successful ingestion now has a stable application-level acknowledgement.

HTTP hosts can safely return `202` only after runtime ingestion succeeds.

Future durable infrastructure can extend or replace the receipt semantics without changing commerce projections or query behavior.

## Implementation Notes

`IngestionOutcome` is defined in `@ci/runtime` input contracts. `RuntimeIngestionHandler` creates the outcome after `Runtime.ingest()` completes. `HttpWebhookAdapter` returns the outcome in its success response.

## Impact

No changes to projection behavior, query behavior, simulation, commerce events, or package dependency direction.
