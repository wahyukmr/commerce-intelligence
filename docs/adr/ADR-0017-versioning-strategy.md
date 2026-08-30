# ADR-0017 — Versioning Strategy

* **Status:** Superseded
* **Date:** 2026-08-17
* **Superseded by:** ADR-0022

---
## Supersession

This decision has been superseded by [ADR-0022 — Adopt Application-Level Release Boundaries](./ADR-0022-application-level-release-boundaries.md).

The repository initially adopted Changesets to provide package-level version metadata and preserve a future path toward package publication.

After evaluating the actual release model of the repository, the internal packages are not independently published, consumed externally, or released on independent cadences. The deployable release boundary is the Commerce Intelligence application/system.

ADR-0022 therefore replaces Changesets-based package versioning with an application-level release model.

---

## Context

The repository contains reusable packages but does not publish them externally.

Internal consumers should always reference the current workspace version.

Repository history should clearly describe user-visible changes.

---

## Decision

The repository adopts:

* workspace protocol for internal dependencies;
* Changesets for version metadata;
* Conventional Commits for commit history.

Package versions are maintained in each package manifest; internal dependency links use the workspace protocol.

---

## Rationale

This strategy:

* simplifies dependency management;
* preserves release history;
* supports future package publication if required.

---

## Consequences

### Positive

* Clear release history.
* Consistent version tracking.
* Future publishing remains possible.

### Negative

* Contributors must understand Changesets when modifying public APIs.

---

## Alternatives Considered

### Manual Version Management

Rejected.

Manual versioning is error-prone and difficult to scale.

---

### Independent Internal Versions Without Changesets

Rejected.

Repository history becomes harder to understand and automate.

---

## Review

Review if package publishing becomes part of the development workflow.
