# ADR-0013 — Standardize Git Hooks with Husky

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Repository quality should be enforced as early as possible.

Developers should receive feedback before changes reach continuous integration.

Git hooks provide a lightweight validation mechanism.

---

## Decision

Adopt **Husky** for repository Git hooks.

Current hooks include:

* pre-commit;
* commit-msg;

Hook responsibilities:

* pre-commit: lint-staged.
* commit-msg: Conventional Commit validation.

---

## Rationale

Husky is lightweight, widely adopted, and integrates well with pnpm.

Keeping hooks focused prevents unnecessary delays during development.

---

## Consequences

### Positive

* Earlier feedback.
* Reduced CI failures.
* Improved commit quality.
* Consistent local workflow.

### Negative

* Developers execute validation before every commit or push.

---

## Alternatives Considered

### CI Only

Rejected.

Waiting until CI delays feedback and increases iteration time.

---

### Custom Git Hook Scripts

Rejected.

Custom solutions introduce maintenance overhead without providing meaningful advantages.

---

## Review

Review when repository validation workflow changes.
