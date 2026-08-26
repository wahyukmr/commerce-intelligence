# ADR-0005 — Adopt ECMAScript Modules Only

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Supporting both CommonJS and ECMAScript Modules increases build complexity, testing effort, and configuration overhead.

All consumers of this repository are internal and run on modern JavaScript runtimes.

---

## Decision

Standardize on ECMAScript Modules.

Repository rules:

* `"type": "module"`
* ESM output only
* `import` / `export`
* no CommonJS builds

Libraries produce only ESM artifacts.

---

## Rationale

Modern tooling, Node.js, and browsers all support ESM natively.

Supporting CommonJS would increase maintenance cost without providing meaningful value for this repository.

---

## Consequences

### Positive

* Simpler build configuration.
* Smaller maintenance surface.
* Better compatibility with modern tooling.
* Consistent module system across the repository.

### Negative

Legacy CommonJS consumers are unsupported.

This limitation is acceptable because the repository is internal.

---

## Alternatives Considered

### Dual Package (ESM + CommonJS)

Rejected.

Reasons:

* duplicated build outputs;
* additional testing;
* more complex exports;
* unnecessary maintenance burden.

---

## Review

This decision should only be revisited if external consumers require CommonJS support, which is currently outside the repository scope.
