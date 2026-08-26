# ADR-0016 — Continuous Integration Strategy

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Every contribution should be validated consistently before reaching the default branch.

Validation should be reproducible locally and in continuous integration.

---

## Decision

GitHub Actions is adopted as the repository CI platform.

Every pull request executes:

* dependency installation;
* lint;
* type checking;
* testing;
* build.

The CI pipeline must use the same package manager, Node.js version, and repository scripts used by developers.

---

## Rationale

A single validation pipeline:

* improves reliability;
* prevents configuration drift;
* ensures reproducible builds;
* reduces deployment risk.

---

## Consequences

### Positive

* Consistent validation.
* Early defect detection.
* Reproducible builds.
* Shared developer workflow.

### Negative

* CI failures block merges.
* Build time increases as the repository grows.

---

## Alternatives Considered

### Multiple Independent Workflows

Rejected.

Multiple overlapping workflows increase maintenance complexity and reduce consistency.

---

### Manual Validation

Rejected.

Manual validation cannot guarantee consistent repository quality.

---

## Review

Review when deployment automation or repository scale requires pipeline changes.
