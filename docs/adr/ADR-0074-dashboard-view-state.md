# ADR-0074 — Dashboard View State Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-17

## Context

Dashboard features need a consistent representation of loading, success, empty and error conditions.

## Decision

Represent feature-level view state as a small discriminated union in the dashboard application layer. Query services remain responsible only for data access.

## Consequences

UI code receives predictable states without adding state-management infrastructure or coupling runtime state to presentation concerns.
