# ADR-0001 — Adopt a Monorepo

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Commerce Intelligence is expected to evolve into a platform consisting of multiple applications, reusable libraries, shared tooling, and engineering documentation.

The repository must support:

* multiple frontend applications;
* reusable internal packages;
* centralized tooling;
* consistent engineering practices;
* fast local development;
* scalable dependency management.

Maintaining independent repositories would introduce duplicated tooling, duplicated CI/CD pipelines, inconsistent dependency versions, fragmented documentation, and more expensive cross-project refactoring.

---

## Decision

Adopt a single monorepo containing:

* applications;
* reusable packages;
* engineering documentation;
* e2e tests.

Repository layout:

```text
apps/
docs/
packages/
apps/<app>/e2e/
```

Applications consume internal packages through workspace dependencies.

---

## Rationale

A monorepo provides:

* one dependency graph;
* one CI pipeline;
* one release strategy;
* one documentation source;
* one engineering standard.

Because every package is internal, independent versioning provides little value.

---

## Consequences

### Positive

* Easier refactoring across packages.
* Shared tooling.
* Faster dependency updates.
* Unified documentation.
* Consistent engineering practices.

### Negative

* Repository size increases over time.
* Architectural discipline becomes critical.
* Poor package boundaries affect the entire repository.

---

## Alternatives Considered

### Multiple Repositories

Rejected.

Reasons:

* duplicated tooling;
* duplicated CI;
* version synchronization;
* fragmented documentation;
* slower development.

---

## Review

This decision should be revisited only if repository size or organizational structure makes a monorepo impractical.
