# ADR-0019 — Repository Conventions

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

A growing repository with multiple contributors requires consistent engineering conventions.

Without shared conventions:

* code style diverges;
* project structure becomes inconsistent;
* onboarding becomes slower;
* reviews focus on style instead of design.

---

## Decision

The repository standardizes conventions covering:

* naming;
* package structure;
* import rules;
* export rules;
* TypeScript usage;
* React structure;
* testing;
* documentation;
* Git workflow.

These conventions are documented in `docs/conventions.md`.

---

## Rationale

Shared conventions:

* improve readability;
* reduce review overhead;
* simplify onboarding;
* create a consistent developer experience.

---

## Consequences

### Positive

* Predictable repository structure.
* Consistent coding style.
* Faster reviews.
* Easier maintenance.

### Negative

* Contributors should learn repository conventions before introducing new patterns.

---

## Alternatives Considered

### Team-Specific Conventions

Rejected.

Different conventions across packages reduce consistency and increase cognitive load.

---

### Convention by Individual Preference

Rejected.

Personal preferences do not scale in a shared engineering platform.

---

## Review

Review when repository standards evolve or significant architectural changes introduce new engineering conventions.
