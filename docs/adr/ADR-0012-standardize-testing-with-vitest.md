# ADR-0012 — Standardize Testing with Vitest

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Applications and libraries require a modern testing framework with strong TypeScript support and fast execution.

The repository also requires:

* React support;
* Node support;
* workspace compatibility.

---

## Decision

Adopt **Vitest** as the standard testing framework.

Testing principles:

* colocated tests;
* behavior-focused assertions;
* package-level testing.

Coverage thresholds are not currently configured in the repository.

---

## Rationale

Vitest integrates naturally with:

* Vite;
* TypeScript;
* Turborepo;
* modern ESM workflows.

It minimizes configuration while providing excellent developer experience.

---

## Consequences

### Positive

* Fast execution.
* Native ESM support.
* Unified testing strategy.
* Consistent developer workflow.

### Negative

* Repository testing conventions become tied to Vitest APIs.

---

## Alternatives Considered

### Jest

Rejected.

Jest remains capable but requires additional configuration for modern ESM workflows and offers less alignment with the repository toolchain.

---

## Review

Review when testing requirements fundamentally change.
