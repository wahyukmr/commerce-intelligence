# Commerce Intelligence Platform

Commerce Intelligence Platform is a production-oriented analytics platform that transforms commerce events into business insights through a modular runtime architecture.

The long-term vision is to support production commerce systems while maintaining a simulation-first workflow during early development.

## Repository Structure

```text
apps/
packages/
docs/
scripts/
```

## Applications

| App | Description |
|------|-------------|
| dashboard | Reference dashboard application |

## Packages

| Package | Responsibility |
|----------|----------------|
| runtime | Core runtime contracts and execution |
| commerce | Commerce capabilities |
| simulation | Synthetic commerce simulator |
| shared | Shared utilities and primitives |

## Requirements

- Node.js 24+
- pnpm 11+

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Type Check

```bash
pnpm typecheck
```

## Test

```bash
pnpm test
```

## Format

```bash
pnpm format
```

## Lint

```bash
pnpm check
```

## Documentation

Architecture documentation is located in:

```
docs/
```

Architecture decisions are documented under:

```
docs/05-adr/
```

## License

MIT
