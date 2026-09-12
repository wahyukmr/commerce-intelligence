# ADR-0058 — Ingestion Observability

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

Production ingestion needs measurable counts and latency without coupling the runtime to a logging or metrics vendor.

## Decision

Define an `IngestionObserver` callback boundary and an `IngestionMetrics` contract. Provide `InMemoryIngestionMetrics` and a small observer adapter as the reference implementation. External metrics systems may consume the same callbacks at the application boundary.

## Consequences

The runtime exposes operational facts without selecting Prometheus, OpenTelemetry, Datadog, or another vendor. Metrics remain an application concern and can be replaced without changing event processing logic.
