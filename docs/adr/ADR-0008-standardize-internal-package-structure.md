# ADR-0008 — Standardize Internal Package Structure

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Different folder layouts across packages increase cognitive load and reduce developer productivity.

A predictable package structure improves navigation and onboarding.

---

## Decision

Reusable code packages follow the common structure below. Configuration packages may use a smaller layout.

```text
packages/

    package.json
    tsconfig.json
    vitest.config.ts (when tests are included)

src/

    index.ts
```

Implementation is organized by feature rather than by file type.

---

## Rationale

Standardization:

* improves consistency;
* reduces onboarding time;
* simplifies tooling;
* reduces maintenance overhead.

---

## Consequences

### Positive

* Predictable repository structure.
* Easier navigation.
* Reduced configuration differences.

### Negative

* Exceptional package layouts require explicit justification.

---

## Alternatives Considered

### Package-specific Layouts

Rejected.

Different layouts introduce unnecessary complexity.

---

## Review

Review only if repository standards evolve significantly.
