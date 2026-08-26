# ADR-0002 — Adopt pnpm Workspaces

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

A monorepo requires a workspace-aware package manager capable of:

* workspace linking;
* deterministic installs;
* efficient disk usage;
* lockfile consistency.

---

## Decision

Use **pnpm Workspaces** as the repository package manager.

All internal packages reference one another using:

```json
"workspace:*"
```

---

## Rationale

pnpm provides:

* content-addressable storage;
* fast installations;
* strict dependency isolation;
* native workspace support;
* deterministic lockfiles.

These characteristics align with the repository goals.

---

## Consequences

### Positive

* Faster installation.
* Lower disk usage.
* Reliable workspace linking.
* Predictable dependency resolution.

### Negative

Developers must use pnpm.

Other package managers are unsupported.

---

## Alternatives Considered

### npm Workspaces

Rejected due to weaker workspace ergonomics and slower installations.

### Yarn

Rejected to reduce ecosystem complexity and because pnpm better matches repository requirements.

---

## Review

The repository standardizes on pnpm unless future requirements fundamentally change.
