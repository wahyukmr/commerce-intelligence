# ADR-0018 — Dependency Management Policy

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Every additional dependency introduces maintenance, security, licensing, and upgrade responsibilities.

The repository should avoid unnecessary external dependencies while remaining productive.

---

## Decision

Every new dependency must satisfy the following criteria:

* actively maintained;
* compatible license;
* appropriate community adoption;
* clear maintenance history;
* justified by repository needs.

Dependencies should be added only after evaluating existing solutions already present in the repository.

---

## Rationale

Careful dependency management:

* reduces maintenance cost;
* lowers security risk;
* simplifies upgrades;
* minimizes transitive dependency growth.

---

## Consequences

### Positive

* Smaller dependency graph.
* Easier upgrades.
* Reduced security exposure.
* Better long-term maintainability.

### Negative

* Introducing new libraries requires additional review.

---

## Alternatives Considered

### Unrestricted Dependency Adoption

Rejected.

Uncontrolled dependency growth increases maintenance burden and architectural inconsistency.

---

## Review

Review periodically as repository requirements and ecosystem maturity evolve.
