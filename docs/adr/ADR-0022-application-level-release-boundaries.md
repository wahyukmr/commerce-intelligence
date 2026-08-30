# ADR-0022 — Application-Level Release Boundaries

* **Status:** Accepted
* **Date:** 2026-08-30
* **Supersedes:** ADR-0017

## Context

The Commerce Intelligence repository is a pnpm/Turborepo monorepo containing a deployable React/Vite dashboard and internal workspace packages.

The internal packages provide implementation boundaries within the application architecture:

* runtime;
* commerce;
* simulation;
* shared;
* configuration packages.

These packages are consumed through the workspace and are not currently published to npm or another package registry.

The repository therefore does not currently have independent package consumers, independent package release cadences, or package-level compatibility contracts.

The previous versioning strategy adopted Changesets for package release metadata. This introduced package-level release concepts without an actual package-level release lifecycle.

This created unnecessary release ceremony for changes that are ultimately deployed as part of the Commerce Intelligence application.

## Decision

The repository adopts application-level release boundaries.

The Commerce Intelligence application/system is the primary release unit.

Internal workspace packages are implementation units and are not independently versioned or released.

Internal dependencies must continue to use the pnpm workspace protocol.

Examples:

```json
{
  "dependencies": {
    "@ci/runtime": "workspace:*"
  }
}
```

Changesets will not be used for package versioning, changelog generation, or release coordination.

The repository will rely on:

* Git history;
* Conventional Commits;
* pull requests;
* CI validation;
* deployment metadata;
* application-level release notes when required.

## Rationale

The release boundary should correspond to the artifact that consumers actually receive.

Currently, consumers receive the deployed Commerce Intelligence application rather than individual internal packages.

Application-level releases therefore:

* match the actual deployment model;
* remove unnecessary package-level release ceremony;
* avoid maintaining versions that have no external compatibility meaning;
* preserve the modularity benefits of the monorepo;
* keep Turborepo responsible for dependency-aware build orchestration;
* keep Git and CI responsible for traceability and validation.

Removing Changesets does not remove versioning discipline. It moves versioning responsibility to the actual release boundary.

## Consequences

### Positive

* Contributors no longer need to create changesets for ordinary changes.
* Internal package changes do not require artificial version bumps.
* Release workflow becomes smaller and easier to understand.
* Turborepo remains focused on build, test, and dependency orchestration.
* Git history remains the source of truth for change history.
* The repository's release model matches its deployment model.

### Negative

* Individual internal packages do not have independent changelogs.
* Package-level release history is not represented by semantic versions.
* Introducing external consumers later will require revisiting the release strategy.
* Application-level release notes require deliberate curation when a release needs them.

## Alternatives Considered

### Continue Using Changesets

Rejected.

Changesets is well suited to multi-package repositories where packages have independent release lifecycles, versioning requirements, or publishing workflows.

Those conditions do not currently exist in this repository.

Using Changesets only because the repository is a monorepo would introduce release ceremony without a corresponding release requirement.

### Manual Versioning of Internal Packages

Rejected.

Manual package versioning would preserve the same unnecessary package-level release boundary while adding additional maintenance work.

### Semantic Release or Equivalent

Rejected.

Automated semantic versioning would solve the same package-level release problem that does not currently exist.

Introducing another release automation tool would add complexity without addressing an actual repository requirement.

### No Release Process

Rejected.

The repository still requires deterministic, traceable, and validated application releases.

Removing package-level versioning does not remove the need for application deployment, CI validation, release notes, and rollback procedures.

## Reconsideration Criteria

The decision should be revisited if one or more internal packages:

* are published to a private or public package registry;
* are consumed by repositories outside this monorepo;
* require independent release cadences;
* require independent semantic versioning;
* require package-level changelogs;
* become an externally supported API or compatibility boundary.

If these conditions emerge, package-level release tooling such as Changesets may be reconsidered through a new ADR.
