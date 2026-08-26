# ADR-0011 — Standardize Code Quality with Biome

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

The repository requires consistent formatting, linting, and import organization.

Maintaining separate tools for formatting and linting increases configuration complexity and maintenance effort.

---

## Decision

Adopt **Biome** as the standard tool for:

* formatting;
* linting;
* import organization.

Biome configuration is centralized at the repository root.

All workspaces follow the same rules.

---

## Rationale

Biome provides:

* high performance;
* unified tooling;
* minimal configuration;
* deterministic formatting;
* consistent developer experience.

---

## Consequences

### Positive

* One tool replaces multiple tools.
* Faster execution.
* Simpler configuration.
* Consistent formatting across the repository.

### Negative

* Repository formatting follows Biome conventions.
* Custom formatting preferences are intentionally limited.

---

## Alternatives Considered

### ESLint + Prettier

Rejected.

Maintaining two independent tools increases complexity without providing sufficient benefits for this repository.

---

### ESLint Only

Rejected.

Formatting and linting remain separate concerns.

---

## Review

Review when repository-wide code quality requirements change.
