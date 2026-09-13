# ADR-0070 — Paged Event Journal Reads

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
Reading an entire event journal into application memory is not viable as event volume grows.

## Decision
EventStore exposes an ordered `readPage()` operation using the journal sequence as the continuation position. Recovery consumes pages until an empty page is returned.

`readAll()` remains as a compatibility convenience implemented in terms of `readPage()`.

## Consequences
- Recovery memory usage is bounded by the configured page size.
- PostgreSQL and in-memory stores share the same ordered paging semantics.
- Checkpointing can be added later without changing the event model.
