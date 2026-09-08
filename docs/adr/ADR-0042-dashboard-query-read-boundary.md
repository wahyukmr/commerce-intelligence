# ADR-0042: Dashboard Query Read Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-08

## Context

M4.8 introduced a composition object for existing commerce query implementations. Dashboard code still needed a stable read-side boundary that could consume this composition without duplicating query selection or knowing runtime internals.

The dashboard should not contain commerce calculation logic, projection registration logic, or imports from internal package paths.

## Decision

Introduce `CommerceDashboardQueryService` as a thin application read boundary.

The service receives an existing `Runtime` and `CommerceQueryComposition`.

It provides:

- query listing
- domain-scoped query listing
- query lookup
- query execution delegated to `Runtime.query()`

The service does not create query implementations or calculate analytics.

## Alternatives Considered

### Call Runtime directly from every dashboard component

Rejected because it spreads query lookup and runtime coupling across the UI layer.

### Add dashboard-specific query implementations

Rejected because commerce analytics belong to `@ci/commerce`.

### Put the read service in `@ci/runtime`

Rejected because it would couple the generic runtime to the commerce application domain.

## Consequences

Dashboard application code receives a single read-side abstraction.

Commerce query implementations remain reusable outside the dashboard.

The generic runtime remains domain-agnostic.

The service remains intentionally thin and can be removed if the dashboard application becomes small enough that the abstraction no longer provides value.

## Implementation Notes

`CommerceDashboardQueryService` is located under the dashboard application because it is an application-level adapter.

It uses only public APIs from `@ci/commerce` and `@ci/runtime`.

## Impact

Affected application:

- `apps/dashboard`

Affected packages:

- none

The package dependency graph remains unchanged.
