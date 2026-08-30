# Commerce Intelligence Platform

Commerce Intelligence Platform is a production-oriented analytics platform that transforms commerce events into business insights through a modular runtime architecture.

The platform is designed around a simulation-first workflow during early development, with internal packages providing clear domain and infrastructure boundaries for the application.

## Repository Structure

```text
commerce-intelligence/
├── apps/
│   └── dashboard/          # React/Vite reference application
├── packages/
│   ├── commerce/            # Commerce capabilities
│   ├── runtime/             # Runtime contracts and execution
│   ├── simulation/          # Synthetic commerce simulator
│   ├── shared/              # Shared utilities and primitives
│   └── config-*/            # Shared development configuration
├── docs/                    # Engineering documentation and ADRs
├── .github/                 # CI/CD workflows
├── package.json             # Root workspace commands
├── pnpm-workspace.yaml      # pnpm workspace definition
└── turbo.json               # Turborepo task orchestration
```

## Applications

| Application | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| `dashboard` | Reference React/Vite application for exploring Commerce Intelligence capabilities |

## Internal Packages

| Package                 | Responsibility                       |
| ----------------------- | ------------------------------------ |
| `@ci/runtime`           | Core runtime contracts and execution |
| `@ci/commerce`          | Commerce domain capabilities         |
| `@ci/simulation`        | Synthetic commerce simulation        |
| `@ci/shared`            | Shared utilities and primitives      |
| `@ci/config-env`        | Shared environment configuration     |
| `@ci/config-typescript` | Shared TypeScript configuration      |
| `@ci/config-vitest`     | Shared Vitest configuration          |

Internal packages are workspace implementation boundaries. They are not independently published packages.

Internal dependencies use the pnpm workspace protocol:

```json
{
  "dependencies": {
    "@ci/runtime": "workspace:*"
  }
}
```

## Technology

* TypeScript
* React
* Vite
* pnpm Workspaces
* Turborepo
* Vitest
* Playwright
* Biome
* Husky
* Zod

## Requirements

* Node.js 24+
* pnpm 11+
* Git

The repository uses pnpm `11.17.0`.

## Quick Start

Enable Corepack if necessary:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Run the development workspace:

```bash
pnpm dev
```

## Development Commands

### Build

Build all workspaces through Turborepo:

```bash
pnpm build
```

### Type Checking

Run TypeScript checks across the workspace:

```bash
pnpm typecheck
```

### Tests

Run all unit and integration tests:

```bash
pnpm test
```

Run dashboard end-to-end tests:

```bash
pnpm test:e2e
```

Run dashboard E2E tests in headed mode:

```bash
pnpm test:e2e:debug
```

### Linting

Run Biome checks:

```bash
pnpm lint
```

Automatically apply available lint fixes:

```bash
pnpm lint:fix
```

### Full Local Check

Run linting, type checking, and tests:

```bash
pnpm check
```

### Cleaning

Remove generated workspace outputs:

```bash
pnpm clean
```

## Engineering Workflow

Changes follow the repository contribution workflow:

```text
Issue / Task
     ↓
Feature Branch
     ↓
Implementation
     ↓
Local Validation
     ↓
Conventional Commit
     ↓
Pull Request
     ↓
CI Validation
     ↓
Code Review
     ↓
Squash Merge
     ↓
Deployment
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution and pull request workflow.

## Documentation

The `docs/` directory contains the canonical engineering documentation.

| Topic                   | Document                                     |
| ----------------------- | -------------------------------------------- |
| Architecture            | [docs/architecture.md](docs/architecture.md) |
| Development Workflow    | [docs/development.md](docs/development.md)   |
| Testing                 | [docs/testing.md](docs/testing.md)           |
| Coding Conventions      | [docs/conventions.md](docs/conventions.md)   |
| Release Process         | [docs/release.md](docs/release.md)           |
| Architectural Decisions | [docs/adr/](docs/adr/)                       |

The documentation index is available at [docs/README.md](docs/README.md).

## Release Model

Commerce Intelligence uses an application-level release model.

The deployable application/system is the release boundary. Internal workspace packages are implementation units and are not independently versioned or published.

Package-level release tooling is therefore not required.

The release process is documented in [docs/release.md](docs/release.md).

## License

MIT. See [LICENSE](LICENSE).
