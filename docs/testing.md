# Testing Guide <!-- omit in toc -->

This document defines the testing strategy for the Commerce Intelligence monorepo.

Testing is treated as a design activity rather than a validation step performed after implementation.

Packages that contain executable behavior should be independently testable. Configuration-only packages may not define a test script.

## Table of Contents <!-- omit in toc -->
- [Testing Philosophy](#testing-philosophy)
- [Testing Pyramid](#testing-pyramid)
- [Test Types](#test-types)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests](#end-to-end-tests)
- [Repository Structure](#repository-structure)
- [Test Naming](#test-naming)
- [Test Organization](#test-organization)
- [Assertions](#assertions)
- [Mocking](#mocking)
- [React Testing](#react-testing)
- [Business Logic Testing](#business-logic-testing)
- [Runtime Testing](#runtime-testing)
- [Environment Testing](#environment-testing)
- [Snapshot Testing](#snapshot-testing)
- [Coverage](#coverage)
- [Performance](#performance)
- [Test Data](#test-data)
- [Continuous Integration](#continuous-integration)

## Testing Philosophy

Tests should verify observable behavior, not implementation details.

A test should continue to pass after an internal refactor if the public behavior has not changed.

Good tests answer questions such as:

* Does this function return the correct result?
* Does this service reject invalid input?
* Does this component render the correct state?
* Does this event produce the expected side effects?

Avoid writing tests that depend on:

* private methods
* internal variables
* implementation order
* specific file structure

## Testing Pyramid

The repository follows a testing pyramid.

```text
               End-to-End
             --
           Integration Tests
        
             Unit Tests
```

The majority of tests should be unit tests.

Integration tests should verify collaboration between modules.

End-to-end tests should focus on critical user journeys only.

## Test Types

### Unit Tests

Unit tests verify a single module in isolation. Examples:

* utility functions
* pricing calculations
* validators
* parsers
* domain services

Unit tests should be fast.

### Integration Tests

Integration tests verify collaboration between multiple modules. Examples:

* runtime + commerce
* commerce + simulation
* configuration loading

Integration tests should avoid external infrastructure whenever possible.

### End-to-End Tests

End-to-end tests verify complete application workflows. The current dashboard suite covers loading the dashboard and the counter interaction. Add new journeys under the dashboard's `e2e/` directory as they are implemented.

End-to-end tests belong to applications, not shared packages.

## Repository Structure

Tests are colocated with implementation.

Good

```text
src/
└── pricing/
    ├── pricing.service.ts
    ├── pricing.test.ts
    └── pricing.types.ts
```

Avoid

```text
tests/
pricing.test.ts
```

Keeping tests close to the implementation improves discoverability and encourages maintenance.

Application-level end-to-end tests live in an `e2e/` directory beside the application's `src/` directory:

```text
apps/
└── dashboard/
    ├── src/
    └── e2e/
        └── dashboard.spec.ts
```

Shared packages do not own browser E2E tests. A root-level E2E suite is reserved for a workflow that genuinely spans multiple applications and has no single application owner.

## Test Naming

Test files use:

```text
*.test.ts
*.test.tsx
```

Examples

```text
logger.test.ts

cache.test.ts

pricing.service.test.ts

ProductCard.test.tsx
```

End-to-end tests use Playwright's `*.spec.ts` convention and must be placed under an application's `e2e/` directory. Unit and integration tests use `*.test.ts` or `*.test.tsx` and remain close to the implementation they exercise.

## Test Organization

Each test file should group related behavior.

Example

```text
describe('calculatePrice')
```

Each test name should describe an expected behavior.

Good

```text
returns discounted price

throws when quantity is negative

uses fallback currency
```

Avoid

```text
test 1

works

happy path
```

A reader should understand the behavior without opening the implementation.



## Assertions

Prefer explicit assertions.

Good

```ts
expect(result).toEqual(expected);
```

Avoid assertions that verify multiple unrelated behaviors in a single test.

Each test should verify one primary expectation.



## Mocking

Mock only external boundaries.

Appropriate candidates include:

* HTTP requests
* file system
* timers
* environment variables
* databases
* external services

Do not mock pure functions inside the same package.

Testing real business logic provides more confidence than testing mocked implementations.



## React Testing

React tests should focus on user-visible behavior. Verify:

* rendered content
* accessibility roles
* interactions
* state changes

Avoid testing:

* component internals
* implementation-specific hooks
* React lifecycle details

Use Testing Library queries in the following order:

1. getByRole
2. getByLabelText
3. getByPlaceholderText
4. getByText
5. getByTestId (last resort)

## Business Logic Testing

Business logic should be deterministic.

Tests should avoid:

* current time
* random values
* network access

Inject dependencies instead of relying on global state. Example:

- Instead of reading the current time directly, inject a clock abstraction.

- Instead of generating random values, inject a generator.

- Deterministic inputs produce deterministic tests.

## Runtime Testing

Runtime packages interact with infrastructure.

Tests should isolate infrastructure boundaries.

Examples:

* fake storage
* fake cache
* fake logger

Avoid coupling tests to specific infrastructure implementations.

## Environment Testing

Environment validation should verify:

* required variables
* invalid values
* missing values
* parsing failures

Environment schemas should fail fast during application startup.

## Snapshot Testing

Snapshot tests are allowed only when they provide meaningful value.

Appropriate examples:

* large React trees
* generated reports
* serialization formats

Do not use snapshots as a replacement for explicit assertions.

## Coverage

Coverage measures confidence, not quality.

The repository does not currently configure or enforce numeric coverage thresholds. When coverage is introduced, thresholds should be documented with the corresponding Vitest configuration rather than maintained only in this guide.

Coverage is a signal of confidence, not proof of correctness.

## Performance

Tests should remain fast. Guidelines:

* avoid unnecessary mocks
* avoid unnecessary rendering
* avoid unnecessary setup
* avoid global mutable state

The complete test suite should be suitable for execution during continuous integration.

## Test Data

Create only the data required for each test.

Avoid large fixtures when a small object is sufficient.

Prefer builder functions over shared mutable fixtures.

Example:

```text
createProduct()

createOrder()

createInventory()
```

Builders improve readability and reduce duplication.

## Continuous Integration

Every pull request executes:

```text
Install
    │
    ▼
Lint
    │
    ▼
Type Check
    │
    ▼
Unit Tests
    │
    ▼
Build
```

A failing test blocks the merge.

Deployment verification runs the same Playwright E2E command against the deployed dashboard URL. Keep new dashboard user journeys in `apps/dashboard/e2e/*.spec.ts`; keep package and module tests colocated as `*.test.ts`.
