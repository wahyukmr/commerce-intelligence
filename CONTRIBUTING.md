# Contributing

## Philosophy

The repository follows Specification Driven Development.

Implementation must follow existing architecture decisions.

Architecture must not evolve through implementation.

## Branch Strategy

Primary branch:

```
main
```

## Commit Convention

Use Conventional Commits.

Examples:

```
feat(runtime): add projection registry

fix(simulation): correct purchase timeline

docs(adr): add runtime architecture
```

## Code Review Checklist

Every pull request must:

- Build successfully
- Pass lint
- Pass typecheck
- Pass tests
- Follow package boundaries
- Respect ADR decisions
- Avoid introducing package-level version changes unless explicitly required by the release model

## Public API

Only `src/index.ts` may be imported from another package.

Imports such as:

```
package/internal/*
```

are forbidden.

## Architecture

If a change modifies architecture, an ADR must accompany the implementation.
