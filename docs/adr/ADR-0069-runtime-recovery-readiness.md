# ADR-0069 — Runtime Recovery Readiness Gate

## Status

* **Status:** Accepted
* **Date:** 2026-09-13


## Context
A newly started process can have a durable event journal while its in-memory projections are still empty. Accepting live ingestion before recovery completes can cause duplicate events to be rejected before they have been applied to the new runtime instance.

## Decision
Runtime ingestion is gated by a small readiness state. A runtime starts in `recovering`, recovery transitions it to `ready` only after all pages have been applied successfully, and failed recovery leaves it in `recovering`.

## Consequences
- Live ingestion cannot race with startup recovery.
- The application composition root must complete recovery before serving ingestion and analytics traffic.
- The gate is not a persistence mechanism and does not introduce a new scheduler or orchestration framework.
