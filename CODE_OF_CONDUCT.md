# Code of Conduct

## Purpose

The purpose of this document is to establish a professional, respectful, and productive engineering culture for everyone contributing to the Commerce Intelligence repository.

This repository is an internal engineering platform. Every contribution should improve the long-term quality of the codebase, documentation, and development experience.

---

# Core Principles

Every contributor is expected to:

* communicate respectfully;
* discuss ideas objectively;
* assume good intent;
* accept constructive feedback;
* prioritize technical correctness over personal preference;
* leave the repository in a better state than it was found.

Engineering discussions should focus on evidence, trade-offs, and long-term maintainability.

---

# Engineering Values

## Correctness Before Speed

Shipping quickly is valuable only if the resulting software remains correct and maintainable.

Temporary shortcuts should be explicitly documented and scheduled for follow-up.

---

## Consistency Over Individual Preference

A consistent repository is easier to understand than one containing multiple competing styles.

Repository conventions take precedence over individual preferences.

---

## Documentation Is Part of the Implementation

Changes that affect architecture, public APIs, development workflow, or repository conventions should include corresponding documentation updates.

Undocumented architectural changes are considered incomplete.

---

## Review Code, Not People

Code reviews exist to improve software quality.

Feedback should focus on:

* correctness;
* maintainability;
* readability;
* performance;
* security;
* architectural consistency.

Avoid comments directed at individuals.

Prefer:

> "This implementation introduces a circular dependency."

Instead of:

> "You designed this incorrectly."

---

## Prefer Questions Before Assumptions

When reviewing code, seek clarification before assuming intent.

Examples:

* "What trade-off led to this design?"
* "Would this belong better in `@ci/runtime`?"
* "Can this dependency be avoided?"

Questions generally produce better discussions than assumptions.

---

# Communication Guidelines

Communication should be:

* respectful;
* concise;
* evidence-based;
* solution-oriented.

Disagreements are expected.

Personal attacks are not.

---

# Code Review Expectations

Every review should aim to answer the following questions.

## Correctness

Does the implementation behave correctly?

---

## Simplicity

Can the implementation be simplified?

---

## Maintainability

Will another engineer understand this code in six months?

---

## Architecture

Does the implementation respect package boundaries?

---

## Testing

Does the implementation include appropriate tests?

---

## Documentation

Does the change require documentation updates?

---

# Giving Feedback

Effective feedback should:

* explain the reason for the suggestion;
* describe trade-offs;
* reference repository conventions when applicable.

Examples:

Good

> Consider moving this logic into `@ci/commerce` because it represents business rules rather than presentation logic.

Less helpful

> Move this somewhere else.

---

# Receiving Feedback

When receiving review comments:

* ask questions if something is unclear;
* focus on technical discussion;
* avoid taking comments personally;
* explain trade-offs when disagreeing.

Disagreement is acceptable when supported by clear technical reasoning.

---

# Decision Making

Engineering decisions should prioritize:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Performance
6. Convenience

Performance optimizations should be supported by evidence rather than assumptions.

---

# Repository Ownership

Every contributor shares responsibility for:

* code quality;
* documentation quality;
* architectural consistency;
* testing quality;
* repository maintainability.

Ownership does not end after a pull request is merged.

---

# Continuous Improvement

The repository is expected to evolve.

Contributors are encouraged to propose improvements to:

* architecture;
* tooling;
* testing;
* documentation;
* development workflow;
* engineering standards.

Significant changes should be discussed before implementation.

---

# Unacceptable Behavior

The following behaviors are not acceptable within repository discussions or reviews:

* personal attacks;
* harassment;
* discriminatory language;
* intentional disruption;
* knowingly introducing malicious code;
* intentionally bypassing security or review processes;
* committing secrets or sensitive credentials.

---

# Conflict Resolution

When technical disagreements cannot be resolved:

1. Clearly document each proposal.
2. Compare trade-offs objectively.
3. Reference existing architectural principles.
4. Prefer consistency with established repository patterns.
5. Record significant architectural decisions as ADRs.

The objective is to reach the best technical outcome rather than to "win" an argument.

---

# Repository Standards

Every contribution should strive to improve at least one of the following:

* readability;
* correctness;
* maintainability;
* testability;
* documentation;
* performance;
* developer experience.

Changes that reduce long-term quality should be avoided unless required to address critical issues, and any resulting technical debt should be documented.

---

# Final Principle

This repository is intended to remain understandable and maintainable for years, not just for the next release.

Every architectural decision, code review, commit, and discussion should support that goal.
