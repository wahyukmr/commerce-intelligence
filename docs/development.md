# Development Guide <!-- omit in toc -->

This document describes the standard development workflow for the Commerce Intelligence monorepo.

Every contributor is expected to follow the practices described here to ensure consistency across the repository.

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Repository Layout](#repository-layout)
  - [apps](#apps)
  - [docs](#docs)
  - [packages](#packages)
- [Daily Workflow](#daily-workflow)
- [Creating a Branch](#creating-a-branch)
- [Working with Applications](#working-with-applications)
- [Working with Packages](#working-with-packages)
- [Adding a New Package](#adding-a-new-package)
- [Adding a New Application](#adding-a-new-application)
- [Dependency Management](#dependency-management)
- [Package Ownership](#package-ownership)
- [TypeScript Guidelines](#typescript-guidelines)
- [Build Guidelines](#build-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Code Review Checklist](#code-review-checklist)
- [Common Pitfalls](#common-pitfalls)
  - [Adding business logic to applications](#adding-business-logic-to-applications)
  - [Creating utility packages too early](#creating-utility-packages-too-early)
  - [Breaking package boundaries](#breaking-package-boundaries)
  - [Circular dependencies](#circular-dependencies)
  - [Duplicating configuration](#duplicating-configuration)

## Prerequisites

Required software:

| Software | Version |
| -------- ||
| Node.js  | 24 LTS or newer |
| pnpm     | 11.x            |
| Git      | Latest stable   |

Optional but recommended:

* Visual Studio Code
* Biome extension
* GitLens

## Local Development Setup

Clone the repository.

```bash
git clone <repository-url>

cd commerce-intelligence
```

Enable Corepack.

```bash
corepack enable
```

Install dependencies.

```bash
pnpm install
```

Verify the installation.

```bash
pnpm lint

pnpm typecheck

pnpm test
```

For the complete command list, see [README.md](README.md#commands). The repository should pass these checks before a pull request.

## Repository Layout

```text
apps/
docs/
packages/
```

Each directory has a dedicated purpose.

### apps

Contains deployable applications.

Applications compose packages.

Applications should not own reusable business logic.

### docs

Contains engineering documentation.

Architecture decisions should be documented here.

### packages

Contains reusable internal packages.

Packages should remain framework-independent whenever possible.

Packages are expected to be reusable across multiple applications.

## Daily Workflow

A normal development session should follow this sequence.

```text
Pull latest main

↓

Create feature branch

↓

Implement changes

↓

Run local validation

↓

Commit

↓

Push

↓

Open Pull Request
```

Avoid working directly on the main branch.

## Creating a Branch

Use descriptive branch names. Good examples:

```text
feature/pricing-engine

feature/product-search

fix/order-rounding

fix/cache-invalidation

refactor/runtime-logger

docs/testing-guide
```

Avoid generic names.

Bad examples:

```text
feature

new

update

fix

test
```

## Working with Applications

Applications are responsible for presentation.

Applications may contain:

* routing
* pages
* layouts
* components
* state management
* application composition

Applications should not become the home of business logic.

Business rules belong inside packages.

## Working with Packages

Every package should have:

```text
src/
package.json
tsconfig.json
vitest.config.ts (when the package has tests)
```

This is the reusable package pattern, not a requirement for configuration packages. `config-typescript` contains only shared TypeScript preset files.

Domain packages should expose one public entry point. Configuration packages may expose documented subpaths.

```text
src/

  index.ts
```

## Adding a New Package

Before creating a new package, ask:

* Is this responsibility already owned by another package?
* Can the functionality remain private to one application?
* Will another package realistically reuse this?

Create a new package only when there is a clear ownership boundary.

## Adding a New Application

Applications belong under:

```text
apps/
```

Every application should follow the same structure.

Applications consume packages.

Applications should not expose reusable APIs.

## Dependency Management

Use the workspace protocol for all internal packages. Example:

```json
{
  "dependencies": {
    "@ci/shared": "workspace:*"
  }
}
```

Never reference internal packages using relative filesystem paths. Incorrect:

```text
../../packages/shared
```

## Package Ownership

Every package has one owner.

Ownership determines where new functionality belongs.

| Package           | Responsibility            |
| ----------------- | ------------------------- |
| shared            | Generic utilities         |
| runtime           | Infrastructure            |
| commerce          | Business rules            |
| simulation        | Forecasting               |
| config-env        | Environment configuration |
| config-typescript | TypeScript configuration  |
| config-vitest     | Vitest configuration      |

If ownership is unclear, stop and discuss the design before implementing.

## TypeScript Guidelines

Always extend a shared TypeScript configuration.

Do not duplicate compiler options inside individual projects.

Choose the appropriate configuration.

| Project                | Configuration      |
| ---------------------- | ------------------ |
| React vite application | react-vite.json    |
| React component        | react-library.json |
| Library                | library.json       |
| Node tooling           | node.json          |

Strict mode is mandatory.

Unsafe type assertions should be avoided whenever possible.

## Build Guidelines

Applications use Vite.

Libraries use tsc.

Do not introduce additional build tools without architectural discussion.

## Testing Guidelines

Every new behavior should have an appropriate test. Unit and integration tests are colocated with implementation; dashboard browser tests live in `apps/dashboard/e2e/`. See [testing.md](testing.md) for the testing policy.

Example:

```text
pricing/

pricing.service.ts

pricing.test.ts
```

## Documentation Guidelines

Documentation should evolve together with the code.

Update documentation whenever:

* a new package is introduced
* public APIs change
* dependency rules change
* build behavior changes
* repository structure changes

Architecture documentation is considered part of the implementation.

## Code Review Checklist

Before requesting review, verify:

* All tests pass.
* Type checking passes.
* Linting passes.
* Build succeeds.
* Documentation is updated when necessary.
* Public API changes are intentional.
* No unnecessary dependencies were introduced.
* Package boundaries remain intact.

## Common Pitfalls

### Adding business logic to applications

Business logic belongs inside packages.

Applications compose behavior.

They should not define it.

### Creating utility packages too early

Do not create a package because code *might* become reusable.

Extract packages only after a clear ownership boundary emerges.

### Breaking package boundaries

Never import implementation details from another package.

Always consume the public API.

### Circular dependencies

Review the dependency graph before introducing a new dependency.

If a dependency points upward, the design should be reconsidered.

### Duplicating configuration

Prefer shared repository conventions.

Avoid introducing package-specific configuration unless there is a justified technical need.
