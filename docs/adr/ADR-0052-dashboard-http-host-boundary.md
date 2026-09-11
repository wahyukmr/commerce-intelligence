# ADR-0052 — Dashboard HTTP Host Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

A real application host still needs a boundary that converts the composition's transport-neutral result into the standard Web `Response` returned by a route handler.

Putting framework-specific server code in `@ci/runtime` would couple the runtime to an application framework. Leaving the conversion to every route would duplicate response handling.

## Decision

The dashboard application provides `createDashboardWebhookHandler()`.

It accepts an `HttpIngestionComposition`, delegates the incoming `Request`, and converts the resulting status/body into a Web `Response`.

The handler is framework-agnostic and uses only standard `Request` and `Response` types.

## Alternatives Considered

### Express adapter inside `@ci/runtime`

Rejected because it couples the generic runtime package to Express.

### Fastify/Hono/Next-specific handlers

Rejected because no concrete application host is required by the current architecture. Framework integration can be added at the application boundary later.

### Additional HTTP abstraction layer

Rejected because `HttpIngestionComposition` already owns the runtime-to-adapter connection. A second host abstraction would add indirection without adding capability.

## Consequences

The dashboard can mount webhook ingestion in any Web-standard compatible host without changing `@ci/runtime`.

The runtime remains transport and framework agnostic.

The dashboard owns the final HTTP response mapping.

## Implementation Notes

`createDashboardWebhookHandler()` adds `content-type: application/json` and `cache-control: no-store` by default and permits additional application headers.

## Impact

Affected package:

- `apps/dashboard`

No changes are required in `@ci/runtime`.
