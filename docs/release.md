# Release Guide <!-- omit in toc -->

This document describes how changes move from development into the main branch and how internal package versions are managed.

Although this repository is private, releases should remain deterministic, traceable, and reproducible.

## Table of Contents <!-- omit in toc -->

- [Release Philosophy](#release-philosophy)
- [Branch Strategy](#branch-strategy)
- [Development Workflow](#development-workflow)
- [Versioning Strategy](#versioning-strategy)
- [Changesets](#changesets)
- [Writing Changesets](#writing-changesets)
- [Pull Requests](#pull-requests)
- [Merge Strategy](#merge-strategy)
- [Release Process](#release-process)
- [Dependency Updates](#dependency-updates)
- [Breaking Changes](#breaking-changes)
- [Rollback Strategy](#rollback-strategy)


## Release Philosophy

The repository follows a trunk-based development model.

* `main` is always releasable.
* Changes are integrated through short-lived branches.
* Every merged pull request must pass the CI pipeline.
* Every release should be reproducible from Git history.

The release process should never depend on manual edits to package versions.

## Branch Strategy

The repository uses the following branch conventions.

```text id="dctwsg"
main

feature/*

fix/*

refactor/*

docs/*

build/*

test/*

ci/*
```

Rules:

* Never commit directly to `main`.
* Keep feature branches focused on one objective.
* Delete merged branches.

## Development Workflow

```text id="8o3ry9"
Create Branch
      │
      ▼
Implement Changes
      │
      ▼
Run Local Validation
      │
      ▼
Commit
      │
      ▼
Push
      │
      ▼
Open Pull Request
      │
      ▼
Code Review
      │
      ▼
CI
      │
      ▼
Squash Merge
```

## Versioning Strategy

Internal packages use the workspace protocol.

Example:

```json id="mjlwmv"
{
  "dependencies": {
    "@ci/shared": "workspace:*"
  }
}
```

Do not reference internal packages using explicit versions.

The workspace protocol resolves local package links during workspace development; it does not make package versions identical.

## Changesets

The repository uses Changesets to record release intent.

Create a changeset whenever a pull request changes:

* public APIs;
* package behavior;
* package dependencies;
* developer-facing functionality.

Pure refactoring that does not change behavior does not require a changeset unless repository policy states otherwise.

Create a changeset:

```bash id="cjlwmr"
pnpm changeset
```

## Writing Changesets

A changeset should describe the observable change. Good:

```text id="4nl0v7"
Add support for tiered pricing.

Improve inventory reservation performance.

Introduce runtime cache abstraction.
```

Avoid:

```text id="b7w0tr"
Update files.

Refactor.

Misc changes.
```

The description should help future developers understand why the release exists.

## Pull Requests

Each pull request should:

* address one primary concern;
* remain reviewable;
* include tests for behavior changes;
* update documentation when necessary;
* include a changeset when appropriate.

Avoid combining unrelated changes into a single pull request.

## Merge Strategy

The repository uses **Squash Merge**.

Reasons:

* cleaner history;
* one logical commit per pull request;
* consistent Conventional Commit messages.

The squash commit message should follow Conventional Commits.

Example:

```text id="jstwk7"
feat(commerce): support tiered pricing
```

## Release Process

When preparing a release:

1. Ensure `main` is green.
2. Pull the latest changes.
3. Install dependencies.
4. Generate release versions.
5. Review generated changes.
6. Commit release metadata.
7. Push to `main`.

Typical workflow:

```bash id="hxm3iu"
pnpm install

pnpm changeset version

pnpm build

pnpm test
```

If publishing is introduced in the future, it should occur only after successful validation.

## Dependency Updates

Update dependencies regularly.

Preferred order:

1. Patch
2. Minor
3. Major

Every dependency update should pass:

* lint
* typecheck
* tests
* build

before merging.

## Breaking Changes

Breaking changes require:

* documentation updates;
* migration guidance;
* architectural review;
* explicit mention in the changeset.

Avoid unnecessary breaking changes for internal consumers.

## Rollback Strategy

If a release introduces a regression:

1. Identify the offending commit.
2. Reproduce the issue.
3. Prefer a targeted fix.
4. If necessary, revert the commit.
5. Restore CI to green before continuing development.

Do not rewrite published Git history on the default branch.
