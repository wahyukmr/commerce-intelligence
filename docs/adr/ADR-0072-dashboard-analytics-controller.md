# ADR-0072 — Dashboard Analytics Controller

## Status

* **Status:** Accepted
* **Date:** 2026-09-17

## Context
Dashboard features should share one read-side application boundary instead of manually constructing query-service calls.

## Decision
Add a thin `DashboardAnalyticsController` that delegates existing typed query references to `CommerceDashboardQueryService`.

## Alternatives Considered
- Let every feature call the query service directly.
- Add feature-specific repositories.
- Move commerce calculations into the controller.

## Consequences
Features get one consistent read-side entrypoint. The controller contains no analytics calculation logic.

## Implementation Notes
Both ordinary and paged query references are delegated through their existing descriptor `execute` functions.

## Impact
No runtime or commerce contract changes.

