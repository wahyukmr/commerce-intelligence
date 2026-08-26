# ADR-0014 — Centralize Environment Configuration

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Environment variables are shared across multiple applications and packages.

Direct access to `process.env` or `import.meta.env` throughout the repository creates:

* duplicated validation;
* inconsistent typing;
* runtime failures;
* security risks.

---

## Decision

Centralize environment management in `@ci/config-env`.

All environment variables are validated during application startup.

Applications consume typed environment objects rather than raw environment variables.

---

## Rationale

Centralization provides:

* type safety;
* validation;
* consistent access patterns;
* improved security;
* simplified maintenance.

---

## Consequences

### Positive

* Single source of truth.
* Fail-fast validation.
* Strong typing.
* Consistent developer experience.

### Negative

* New environment variables must be added to the shared schema before use.

---

## Alternatives Considered

### Direct Environment Access

Rejected.

Direct access leads to duplicated validation and inconsistent behavior across packages.

---

### Per-Application Environment Management

Rejected.

Environment handling is a cross-cutting concern and should remain centralized.

---

## Review

Review when environment management requirements expand beyond the current client/server model.
