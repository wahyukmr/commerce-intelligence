# Architecture <!-- omit in toc -->

Commerce Intelligence is organized as a layered monorepo.

The primary objective of the architecture is to keep business logic reusable, maintainable, independently testable, and independent from presentation technologies.

Applications should primarily compose reusable packages rather than implement business logic directly.

## Table of Contents <!-- omit in toc -->

- [Architectural Principles](#architectural-principles)
- [Repository Structure](#repository-structure)
- [Layer Diagram](#layer-diagram)
- [Layer Responsibilities](#layer-responsibilities)
  - [Shared](#shared)
  - [Runtime](#runtime)
  - [Commerce](#commerce)
  - [Simulation](#simulation)
  - [Applications](#applications)
- [Dependency Rules](#dependency-rules)
- [Circular Dependencies](#circular-dependencies)
- [Package Design](#package-design)
- [Package Structure](#package-structure)
- [Domain Boundaries](#domain-boundaries)
- [Public API](#public-api)
- [Import Rules](#import-rules)
- [Configuration Packages](#configuration-packages)
- [Build Architecture](#build-architecture)
- [TypeScript Architecture](#typescript-architecture)
- [Workspace Architecture](#workspace-architecture)
- [Build Orchestration](#build-orchestration)
- [Testing Strategy](#testing-strategy)
- [Design Guidelines](#design-guidelines)

## Architectural Principles

The architecture is built on the following principles.

1. Single Responsibility
2. Explicit Dependencies
3. Stable Package Boundaries
4. Dependency Inversion where appropriate
5. Domain-Oriented Design
6. Composition over Inheritance
7. Type Safety by Default
8. Public API First

## Repository Structure

```text
.
├── apps/
│   └── dashboard/
├── docs/
└── packages/
      ├── commerce/
      ├── config-env/
      ├── config-typescript/
      ├── config-vitest/
      ├── runtime/
      ├── shared/
      └── simulation/
```

There is currently no root-level `test/` directory. The workspace configuration also declares `tooling/*`, but that directory is not present yet.

Each top-level directory has exactly one responsibility.

## Layer Diagram

```text
                 Applications
                       │
                       ▼
                 Simulation
                       │
                       ▼
                  Commerce
                       │
                       ▼
                   Runtime
                       │
                       ▼
                    Shared
```

Dependencies always point downward.

No package may import a higher layer.

## Layer Responsibilities

### Shared

Shared contains framework-independent utilities.

Typical contents:

* collection helpers
* object utilities
* date utilities
* number utilities
* string utilities
* generic types

Shared should remain completely unaware of business concepts.

Examples of things that DO NOT belong here:

* Product
* Inventory
* Order
* Customer
* Database
* HTTP
* React

### Runtime

Runtime provides infrastructure abstractions.

Examples:

* Logger
* Cache
* HTTP client
* Storage
* Event bus
* Configuration
* Retry
* Scheduler

Runtime knows **how** the system operates.

Runtime never knows **what** the business does.

### Commerce

Commerce contains business rules.

Examples:

* Pricing
* Inventory
* Promotion
* Sales
* Product
* Tax
* Discount

Commerce answers questions such as:

* How is a price calculated?
* When is stock considered unavailable?
* Which promotion has priority?

Commerce must not know:

* React
* Browser APIs
* HTTP
* Express
* Fastify
* Databases

### Simulation

Simulation executes scenarios using Commerce.

Typical responsibilities:

* forecasting
* scenario execution
* simulations
* reports
* statistical analysis

Simulation should never replace Commerce.

Instead:

Simulation asks Commerce to evaluate scenarios.

### Applications

Applications compose all lower layers.

Responsibilities include:

* UI
* Routing
* Authentication
* State Management
* User Interaction

Applications should contain as little business logic as possible.

## Dependency Rules

The intended dependency policy is restrictive.

| Package      | Allowed internal dependencies |
| ------------ | ----------------------------- |
| shared       | none                          |
| runtime      | shared                        |
| commerce     | runtime, shared               |
| simulation   | commerce, runtime, shared     |
| applications | any internal package          |

Any dependency not listed above should be considered invalid.

At present, the domain packages have no declared internal dependencies in their manifests. This table is a policy for future implementation, not a description of an already populated dependency graph.

## Circular Dependencies

Circular dependencies are forbidden.

Invalid:

```text
Commerce
     │
     ▼
Runtime
     │
     ▼
Commerce
```

Invalid:

```text
Simulation
      │
      ▼
Commerce
      │
      ▼
Simulation
```

Circular dependencies:

* reduce maintainability
* slow builds
* complicate testing
* increase coupling

## Package Design

Domain packages should expose one public API. Configuration packages may expose documented subpaths for separate presets or environments.

```text
src/
└── index.ts
```

Consumers should import from the package root or from a documented configuration subpath.

Correct:

```text
packages/<package>/
├── package.json
├── tsconfig.json
├── vitest.config.ts   # when the package has Vitest tests
└── src/
      └── index.ts
```

Configuration packages may use a different minimal layout. `config-typescript`, for example, contains shared JSON presets and has no package build or test script.

Implementation details belong inside `internal/`.

Example:

```text
src/

    internal/

    logger/

    cache/

    retry/
```

Nothing inside `internal/` should be exported.

## Package Structure

A package should be organized by feature.

Recommended:

```text
pricing/

    pricing.service.ts

    pricing.types.ts

    pricing.constants.ts

    pricing.errors.ts

    pricing.test.ts

    index.ts
```

Avoid organizing primarily by file type.

Avoid:

```text
types/

constants/

helpers/

services/

utils/
```

This usually produces high coupling and weak cohesion.

## Domain Boundaries

Every package owns a business capability.

Examples:

- Shared owns reusable utilities.

- Runtime owns infrastructure.

- Commerce owns business rules.

- Simulation owns forecasting.

- Applications own presentation.

- Ownership should never overlap.

## Public API

Every exported symbol is part of the package contract.

Changing the public API should be considered an architectural change.

Internal refactoring should not affect consumers.

## Import Rules

Allowed:

```ts
import { calculatePrice } from '@ci/commerce';
```

Forbidden:

```ts
import { calculatePrice } from '@ci/commerce/src/pricing';
```

Forbidden:

```ts
import { calculatePrice } from '../../commerce/src/pricing';
```

## Configuration Packages

Configuration packages are infrastructure packages.

Current configuration packages:

* @ci/config-env
* @ci/config-typescript
* @ci/config-vitest

They provide configuration only.

They must never contain business logic.

## Build Architecture

Applications are built using Vite.

Libraries are built using tsc.

Type declarations are generated during library builds.

Buildable libraries output:

```text
dist/
├── index.js
├── index.js.map
├── index.d.ts
└── index.d.ts.map
```

Only the `dist/` directory is considered distributable. `config-env` currently exports TypeScript source directly and has no build script.

## TypeScript Architecture

Shared configurations are provided by `@ci/config-typescript`.

```
base
├── library
├── react-library
├── node
└── vite
      └── react-vite
```

Each project extends exactly one configuration appropriate for its runtime.

## Workspace Architecture

The repository is managed as a pnpm workspace.

Applications consume internal packages through the workspace protocol.

Example:

```json
{
  "dependencies": {
    "@ci/shared": "workspace:*"
  }
}
```

Direct filesystem imports between packages are prohibited.

## Build Orchestration

Turborepo orchestrates all workspace tasks.

Core tasks:

* build
* dev
* typecheck
* lint
* test
* clean

The dependency graph determines execution order automatically.

## Testing Strategy

Testing is performed at the package level where a package defines a `test` script.

Tests are colocated with implementation.

Example:

```text
pricing/

    pricing.service.ts

    pricing.test.ts
```

Application E2E tests live in the owning application's `e2e/` directory beside `src/`, using the `*.spec.ts` naming convention. Unit and integration tests remain colocated as `*.test.ts`.

## Design Guidelines

When introducing new functionality:

1. Identify the owning package.
2. Verify the dependency direction.
3. Define the public API.
4. Keep implementation private.
5. Add tests.
6. Update documentation if architectural behavior changes.
