# ADR-0017 — Versioning Strategy

* **Status:** Accepted
* **Date:** 2026-08-17

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
