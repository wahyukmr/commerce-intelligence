# ADR-0064 — REST Polling Recovery Semantics

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Decision
A REST source advances its cursor only after the complete page has been delivered to the ingestion handler and the new cursor has been persisted. Delivery failure therefore leaves the previous cursor available for retry.

## Consequences
A failed page may be delivered again. Runtime event-ID deduplication remains responsible for duplicate protection. The source adapter does not invent partial-page acknowledgements.
