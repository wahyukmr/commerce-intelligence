# ADR-0010 — Enforce Dependency Direction Policy

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Even with architectural layers, developers may accidentally introduce dependencies that violate repository design principles.

Without explicit dependency rules, architectural erosion occurs gradually.

---

## Decision

The repository enforces the following dependency matrix.

| Package               | Allowed Dependencies      |
| --------------------- | ------------------------- |
| shared                | External packages only    |
| runtime               | shared                    |
| commerce              | runtime, shared           |
| simulation            | commerce, runtime, shared |
| applications          | Any internal package      |

Dependencies outside this matrix are considered architectural violations.

---

## Rationale

Explicit dependency rules:

* prevent circular dependencies;
* preserve package ownership;
* maintain architectural integrity;
* simplify reasoning about the system.

---

## Consequences

### Positive

* Stable dependency graph.
* Clear architectural boundaries.
* Easier maintenance.

### Negative

* Some implementations require refactoring to satisfy dependency rules.
* New package introductions require architectural review.

---

## Alternatives Considered

### Developer-defined Dependencies

Rejected.

Allowing unrestricted dependencies leads to inconsistent architecture and long-term maintenance problems.

---

## Review

Review whenever a new architectural layer or package category is introduced.
