# ADR-0004 — Standardize on TypeScript

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Every application and package requires static type checking.

Duplicating compiler configuration across projects increases maintenance cost and configuration drift.

---

## Decision

Adopt TypeScript as the only implementation language for production source code.

Compiler configuration is centralized in `@ci/config-typescript`.

Available configurations include:

* base.json
* library.json
* node.json
* react-library.json
* react-vite.json
* vite.json

Every project extends one shared configuration.

---

## Rationale

Centralized configuration provides:

* consistent compiler behavior;
* easier upgrades;
* simpler maintenance;
* predictable developer experience.

---

## Consequences

### Positive

* Strict type safety.
* Reduced duplication.
* Consistent compiler settings.
* Easier onboarding.

### Negative

Projects requiring special compiler behavior must justify and document those exceptions.

---

## Alternatives Considered

### Per-package Configuration

Rejected.

Configuration duplication becomes increasingly difficult to maintain.

---

## Review

Compiler options should be reviewed during TypeScript major upgrades.
