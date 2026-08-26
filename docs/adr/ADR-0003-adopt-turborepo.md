# ADR-0003 — Adopt Turborepo

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

As the number of packages increases, executing every build, test, and typecheck becomes unnecessarily expensive.

The repository requires:

* incremental execution;
* dependency-aware task scheduling;
* local caching;
* optional remote caching;
* workspace filtering.

---

## Decision

Use Turborepo as the repository task orchestrator.

Repository tasks include:

* build;
* dev;
* lint;
* typecheck;
* test;
* clean.

---

## Rationale

Turborepo provides:

* dependency graph execution;
* task caching;
* parallel execution;
* simple configuration;
* excellent integration with pnpm.

---

## Consequences

### Positive

* Faster CI.
* Faster local development.
* Reduced redundant work.
* Predictable execution order.

### Negative

Developers should understand task dependencies when introducing new workspace scripts.

---

## Alternatives Considered

### Nx

Rejected.

Nx offers a larger feature set but introduces additional concepts and configuration that are unnecessary for the current repository.

### Custom Scripts

Rejected.

Custom orchestration would become difficult to maintain as the repository grows.

---

## Review

Remote caching may be enabled later without changing this architectural decision.
