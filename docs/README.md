# Commerce Intelligence Engineering Documentation <!-- omit in toc -->

This directory contains the canonical engineering documentation for the Commerce Intelligence Platform.

The repository uses focused documents for operational guidance and ADRs for architectural decisions. Each topic should have one canonical source of truth.

## Table of Contents <!-- omit in toc -->

- [Repository Map](#repository-map)
- [Technology](#technology)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Documentation Map](#documentation-map)
- [Architectural Decisions](#architectural-decisions)
- [Source of Truth](#source-of-truth)

## Repository Map

```text
apps/dashboard/   React/Vite reference application with Playwright E2E tests
packages/         Internal packages and shared development configuration
docs/             Engineering documentation and architectural decisions
```

## Technology

| Category               | Technology                 |
| ---------------------- | -------------------------- |
| Language               | TypeScript                 |
| Runtime                | Node.js 24 LTS             |
| Package Manager        | pnpm 11                    |
| Workspace              | pnpm Workspace             |
| Build Orchestration    | Turborepo                  |
| Frontend               | React                      |
| Bundler                | Vite                       |
| Testing                | Vitest                     |
| E2E Testing            | Playwright                 |
| Linting                | Biome                      |
| Formatting             | Biome                      |
| Git Hooks              | Husky                      |
| Environment Validation | Zod                        |
| Release Model          | Application-level releases |

## Quick Start

Requirements:

* Node.js 24 or newer
* pnpm 11
* Git

Enable Corepack if necessary:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Run the repository checks:

```bash
pnpm check
```

## Commands

| Command               | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `pnpm dev`            | Start workspace development tasks             |
| `pnpm build`          | Build all workspaces                          |
| `pnpm lint`           | Run Biome checks                              |
| `pnpm lint:fix`       | Apply available Biome fixes                   |
| `pnpm typecheck`      | Run TypeScript checks                         |
| `pnpm test`           | Run unit and integration tests                |
| `pnpm test:e2e`       | Run dashboard Playwright tests                |
| `pnpm test:e2e:debug` | Run dashboard Playwright tests in headed mode |
| `pnpm check`          | Run lint, typecheck, and tests                |
| `pnpm clean`          | Remove generated workspace outputs            |

Formatting is handled by Biome. There is no separate root `format` script.

## Documentation Map

| Topic                             | Canonical Document                 |
| --------------------------------- | ---------------------------------- |
| Architecture and dependency rules | [architecture.md](architecture.md) |
| Coding conventions                | [conventions.md](conventions.md)   |
| Local development workflow        | [development.md](development.md)   |
| Testing strategy                  | [testing.md](testing.md)           |
| Release process                   | [release.md](release.md)           |
| Architectural decisions           | [adr/](adr/)                       |

Update the relevant canonical document when implementation or workflow changes.

ADRs explain why an architectural decision was made. They do not replace the current operational documentation.

## Architectural Decisions

Architectural decisions are maintained under [`adr/`](adr/).

ADRs should capture:

* the context that led to a decision;
* the decision itself;
* important alternatives considered;
* consequences;
* conditions under which the decision should be reconsidered.

When an architectural decision changes, prefer marking the previous ADR as `Superseded` and creating a new ADR rather than rewriting architectural history.

For example:

```text
ADR-0017
    ↓
Superseded
    ↓
ADR-0022
```

The current release strategy is documented in [release.md](release.md), while the reasoning behind the application-level release boundary is documented in [ADR-0022](adr/ADR-0022-application-level-release-boundaries.md).

## Source of Truth

Use this documentation hierarchy:

```text
README.md
    │
    └── Repository entry point
          │
          ↓
docs/README.md
    │
    ├── Operational documentation
    │      ├── architecture.md
    │      ├── conventions.md
    │      ├── development.md
    │      ├── testing.md
    │      └── release.md
    │
    └── Architectural history
           └── adr/
```

Avoid duplicating detailed operational instructions across multiple documents.
