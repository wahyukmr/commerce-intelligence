# ADR-0009 — Adopt Package Naming Strategy

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Consistent package naming improves discoverability and communicates package ownership.

Inconsistent naming often leads to ambiguous responsibilities.

---

## Decision

All internal packages use:

* lowercase;
* kebab-case;
* `@ci` scope.

Examples:

```text
@ci/runtime

@ci/commerce

@ci/simulation

@ci/config-env

@ci/config-typescript
```

Package names should describe responsibility rather than implementation.

---

## Rationale

Consistent naming:

* improves readability;
* simplifies imports;
* strengthens package identity.

---

## Consequences

### Positive

* Predictable imports.
* Consistent workspace organization.
* Easier package discovery.

### Negative

* Package renaming becomes an architectural change.

---

## Alternatives Considered

### Unscoped Package Names

Rejected.

Scoped packages clearly distinguish internal packages from external dependencies.

---

## Review

Review only if package scope strategy changes.
