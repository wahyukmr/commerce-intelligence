# Commerce Intelligence Dashboard

The dashboard is the reference React/Vite application for the Commerce Intelligence Platform.

It provides the application-facing interface for exploring commerce intelligence capabilities and serves as the primary deployable application in the monorepo.

## Responsibilities

The dashboard is responsible for:

* presenting Commerce Intelligence workflows;
* consuming internal platform packages through the pnpm workspace;
* providing the reference user interface;
* providing browser-level end-to-end coverage through Playwright.

The dashboard is an application, not an independently published package.

## Technology

* React
* TypeScript
* Vite
* Vitest
* Playwright
* Biome
* pnpm Workspace
* Turborepo

## Repository Position

The dashboard sits at the application boundary of the monorepo:

```text
Commerce Intelligence
│
├── apps/
│   └── dashboard/
│       └── React/Vite application
│
└── packages/
    ├── runtime/
    ├── commerce/
    ├── simulation/
    ├── shared/
    └── config-*/
```

The dashboard consumes internal packages through workspace dependencies such as:

```json
{
  "dependencies": {
    "@ci/runtime": "workspace:*"
  }
}
```

Internal packages are implementation boundaries of the platform and are not independently published.

## Development

From the repository root:

```bash
pnpm dev
```

This runs the workspace development tasks through Turborepo.

To work directly with the dashboard package:

```bash
pnpm --filter dashboard dev
```

The Vite development server provides hot module replacement during development.

## Build

Build the dashboard directly:

```bash
pnpm --filter dashboard build
```

Or build the complete workspace from the repository root:

```bash
pnpm build
```

The dashboard build runs TypeScript project compilation followed by the Vite production build.

## Type Checking

Run the dashboard type check:

```bash
pnpm --filter dashboard typecheck
```

Or run type checking across the workspace:

```bash
pnpm typecheck
```

## Unit Tests

Run dashboard unit tests:

```bash
pnpm --filter dashboard test
```

Or run all workspace tests:

```bash
pnpm test
```

Tests use Vitest.

## End-to-End Tests

Run dashboard Playwright tests:

```bash
pnpm test:e2e
```

Run them in headed mode while debugging:

```bash
pnpm test:e2e:debug
```

The E2E suite validates browser-level application behavior rather than individual package implementation details.

## Linting

The repository uses Biome.

Run the dashboard lint check:

```bash
pnpm --filter dashboard lint
```

Apply available fixes:

```bash
pnpm --filter dashboard lint:fix
```

Repository-wide linting can be run with:

```bash
pnpm lint
```

## Environment Configuration

Environment configuration is validated through the repository's shared environment configuration package.

Do not commit secrets or environment-specific credentials.

For environment requirements and configuration policy, see the repository documentation:

* [Environment and Architecture](../../docs/architecture.md)
* [Development Workflow](../../docs/development.md)

## Testing Expectations

Changes to dashboard behavior should include appropriate automated coverage.

Use:

* Vitest for unit and component-level behavior;
* Playwright for browser-level workflows and integration behavior.

A dashboard pull request should pass the repository checks before merge:

```bash
pnpm check
pnpm build
```

When browser behavior is affected, also run:

```bash
pnpm test:e2e
```

## Contribution Workflow

Dashboard changes follow the same repository contribution workflow as the rest of the monorepo:

```text
Issue / Task
     ↓
Feature Branch
     ↓
Implementation
     ↓
Tests
     ↓
Local Validation
     ↓
Pull Request
     ↓
CI
     ↓
Code Review
     ↓
Squash Merge
```

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the complete contribution workflow.

## Release Model

The dashboard is currently the primary deployable application and therefore belongs to the application-level release boundary.

Internal package changes that affect the dashboard are released as part of the application/system.

The dashboard does not use independent package releases or Changesets.

See [Release Process](../../docs/release.md) for the repository release model.
