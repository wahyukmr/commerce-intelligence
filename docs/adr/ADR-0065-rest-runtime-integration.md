# ADR-0065 — REST Adapter Runtime Integration

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Decision
REST source adapters deliver canonical `EventEnvelope` values exclusively through `EventIngestionHandler`. They do not import or construct `Runtime` directly.

## Consequences
Simulation, HTTP webhook, and REST pull sources share the same ingestion boundary. The application composition root remains responsible for connecting the adapter to the runtime.
