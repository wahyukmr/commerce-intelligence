# Commerce Intelligence <!-- omit in toc -->

Internal TypeScript monorepo for the Commerce Intelligence Platform. The current workspace contains the `dashboard` application and reusable packages under `packages/`.

This page is the documentation index. Detailed architecture, development, testing, conventions, and release guidance have one canonical document each; ADRs record the decisions behind them.

## Table of Contents <!-- omit in toc -->

- [Repository Map](#repository-map)
- [Technology](#technology)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Documentation Map](#documentation-map)

## Repository Map

```text
apps/dashboard/   React/Vite application with Playwright E2E tests
packages/         Internal packages and shared configuration
docs/             Engineering documentation and ADRs
```

The pnpm workspace also declares `tooling/*`, but no tooling workspace exists in the current tree.

## Technology

| Category               | Technology                 |
| ---------------------- | -------------------------- |
| Language               | TypeScript 7               |
| Runtime                | Node.js 24 LTS             |
| Package Manager        | pnpm 11                    |
| Workspace              | pnpm Workspace             |
| Build Orchestration    | Turborepo                  |
| Frontend               | React                      |
| Bundler                | Vite                       |
| Library Builder        | TypeScript (`tsc`)         |
| Testing                | Vitest                     |
| Linting                | Biome                      |
| Formatting             | Biome                      |
| Git Hooks              | Husky                      |
| Release Model          | Application-level releases |
| Environment Validation | Zod                        |

## Quick Start

Requirements: Node.js 24 or newer, pnpm 11, and Git.

```bash
corepack enable
pnpm install
pnpm check
```

## Commands

| Command          | Purpose                           |
| ---------------- | --------------------------------- |
| `pnpm dev`       | Start workspace development tasks |
| `pnpm build`     | Build workspaces                  |
| `pnpm lint`      | Run Biome checks                  |
| `pnpm typecheck` | Run TypeScript checks             |
| `pnpm test`      | Run Vitest tests                  |
| `pnpm test:e2e`  | Run dashboard Playwright tests    |
| `pnpm clean`     | Remove generated outputs          |

`pnpm check` runs lint, typecheck, and unit/integration tests. Formatting is performed through Biome; there is no separate `format` script.

## Documentation Map

| Topic                             | Canonical document                 |
| --------------------------------- | ---------------------------------- |
| Architecture and dependency rules | [architecture.md](architecture.md) |
| Coding conventions                | [conventions.md](conventions.md)   |
| Local workflow                    | [development.md](development.md)   |
| Testing                           | [testing.md](testing.md)           |
| Release Process                   | [release.md](release.md)           |
| Architectural decisions           | [adr/](adr/)                       |

Update the relevant canonical document when implementation changes. ADRs explain why a decision was made; they do not replace current operational instructions.

Package responsibilities, dependency policy, and current implementation status are maintained in [architecture.md](architecture.md).
