# ADR-0021 — Adopt Vercel Remote Cache for Turborepo

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

The monorepo uses Turborepo to orchestrate builds, tests, and type checks across packages. As the repository grows, repeated work across CI and local runs becomes increasingly expensive.

Without a shared cache:

* identical tasks are recomputed across runs;
* CI time increases as the repository expands;
* developer feedback loops become slower;
* build and test costs rise without adding product value.

The repository already relies on GitHub Actions for validation and uses Vercel as a platform partner. A shared remote cache provides a natural fit with the existing toolchain and deployment ecosystem.

---

## Decision

The repository adopts Vercel's Turborepo Remote Cache for CI and establishes the required configuration through the repository's GitHub Actions workflow.

The workflow sets up the remote cache with:

* `vercel/setup-turborepo-remote-cache-action@v1.0.0`;
* `team: ${{ vars.TURBO_TEAM }}`;
* `audience: ${{ secrets.TURBO_AUDIENCE }}`;
* `policy: ${{ secrets.TURBO_POLICY_ID }}`.

This configuration is applied in `.github/workflows/ci.yml` so tasks can reuse cached artifacts across CI runs and related executions.

---

## Rationale

The remote cache improves build efficiency by reusing previously computed task outputs instead of rerunning the same work.

This provides:

* faster CI execution for repeated builds and validation runs;
* lower infrastructure cost for redundant task execution;
* shorter feedback cycles for contributors and maintainers;
* better alignment with the Vercel ecosystem used by the application.

A shared cache is especially valuable in a monorepo where many tasks share dependency graphs and compile artifacts across packages.

---

## Consequences

### Positive

* CI runs complete faster for unchanged work.
* Team productivity improves because validation feedback is quicker.
* Intermediate build artifacts are reused across similar workloads.
* Repository validation scales better as the monorepo grows.

### Negative

* Cache correctness depends on properly configured credentials and policies.
* Repository secrets and variables must be maintained for cache access.
* Cache invalidation and policy changes require governance to avoid stale artifacts.

---

## Alternatives Considered

### Local Cache Only

Rejected.

A local cache helps individual machines but does not share results across CI runs or contributors. It does not meaningfully reduce repeated work across the team.

### No Cache

Rejected.

Running all tasks from scratch for every validation cycle increases time and cost without improving correctness. This approach does not scale as the monorepo grows.

---

## Review

Review when the monorepo structure, CI architecture, or caching policy changes significantly, or when the remote cache configuration needs to be updated for a different platform policy or team setup.
