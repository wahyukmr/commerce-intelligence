# Release Guide <!-- omit in toc -->

This document describes how changes move from development into the `main` branch and how releases are created for the Commerce Intelligence Platform.

## Table of Contents <!-- omit in toc -->
- [Release Philosophy](#release-philosophy)
- [Release Boundary](#release-boundary)
- [Versioning Strategy](#versioning-strategy)
- [Development Workflow](#development-workflow)
- [Pull Requests](#pull-requests)
- [CI Validation](#ci-validation)
- [Release Process](#release-process)
- [Release Notes](#release-notes)
- [Breaking Changes](#breaking-changes)
- [Dependency Updates](#dependency-updates)
- [Future Introduction of Package Releases](#future-introduction-of-package-releases)
- [Rollback Strategy](#rollback-strategy)

## Release Philosophy

The repository is an application-oriented monorepo.

The workspace contains internal packages that are consumed through the pnpm workspace and a deployable `dashboard` application. Internal packages are implementation and architecture boundaries, not independently released products.

The repository therefore uses an application-level release model.

The release boundary is the Commerce Intelligence application/system rather than individual workspace packages.

The release process should remain:

* deterministic;
* traceable;
* reproducible from Git history;
* validated by CI;
* independent of package-level release metadata.

## Release Boundary

The repository currently contains:

* `apps/dashboard` — deployable React/Vite application;
* `packages/*` — internal packages and shared configuration.

Internal packages are not published to npm or consumed by external repositories.

Internal dependencies must use the workspace protocol:

```json
{
  "dependencies": {
    "@ci/shared": "workspace:*"
  }
}
```

Internal package versions are therefore not release boundaries.

A change to an internal package is released as part of the application/system that consumes it.

## Versioning Strategy

The repository does not maintain independent release versions for internal workspace packages.

Do not introduce package-level version bumps merely because a package implementation changes.

Internal package manifests may continue to contain a `version` field where required by package tooling, but that field does not represent an independently published release.

Internal dependencies must continue to use the workspace protocol rather than explicit package versions.

## Development Workflow

Changes follow the repository contribution workflow:

```text
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

The expected local validation is:

```bash
pnpm check
pnpm build
```

When applicable, run:

```bash
pnpm test:e2e
```

before opening or updating the pull request.

## Pull Requests

Each pull request should:

* address one primary concern;
* remain reviewable;
* include tests for behavior changes;
* update documentation when necessary;
* respect package boundaries;
* follow applicable ADRs;
* use a Conventional Commit message for the eventual squash commit.

Changesets are not required.

A pull request does not need to create package release metadata.

## CI Validation

Every pull request targeting `main` must pass the repository CI pipeline.

CI validates:

* formatting and linting through Biome;
* TypeScript type checking;
* automated tests;
* production builds.

Deployment-specific E2E verification is performed by the Vercel deployment workflow after a deployment becomes ready.

The repository does not use Changesets as a CI gate.

## Release Process

A release represents a deployable state of the Commerce Intelligence application.

The release process is:

```text
Pull Request
     │
     ▼
CI validation
     │
     ▼
Code Review
     │
     ▼
Squash Merge
     │
     ▼
main
     │
     ▼
Deployment
     │
     ▼
Deployment E2E verification
```

A release does not require updating versions for every internal package.

When a release needs an explicit version identifier, the version belongs to the application/system release rather than to individual internal packages.

The release identifier should be derived from Git history and deployment metadata rather than manually synchronizing versions across internal packages.

## Release Notes

Release notes should describe user-visible or operationally significant changes at the application/system level.

Examples:

* Add tiered pricing analytics.
* Improve inventory reservation performance.
* Add simulation scenario controls.
* Fix dashboard projection rendering.
* Update runtime execution behavior.

Release notes should not list internal package version bumps unless package versioning becomes an explicit release requirement in the future.

## Breaking Changes

Breaking changes are evaluated at the application and architecture boundaries.

A breaking change may require:

* an ADR;
* documentation updates;
* migration guidance;
* affected tests;
* explicit mention in release notes.

A changeset is not required.

Internal package API changes should be evaluated based on their consumers and the application behavior they affect.

## Dependency Updates

Dependency updates should continue to follow the repository dependency management policy.

Every dependency update must pass:

* lint;
* typecheck;
* tests;
* build.

Internal workspace dependencies must continue to use the workspace protocol.

## Future Introduction of Package Releases

Changesets or another release-management tool may be introduced in the future if the repository changes its release model.

Examples of such changes include:

* an internal package is published to a private registry;
* a package gains consumers outside this repository;
* packages acquire independent release cadences;
* package-level changelogs become a requirement;
* package versions become part of an external compatibility contract.

If any of these conditions become true, the release strategy must be revisited through an ADR before introducing package-level release tooling.

## Rollback Strategy

If a release introduces a regression:

1. Identify the offending commit.
2. Reproduce the issue.
3. Prefer a targeted fix.
4. If necessary, revert the offending change.
5. Restore CI and deployment verification to green.

Do not rewrite published Git history on the default branch.
