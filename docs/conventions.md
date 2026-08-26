# Conventions <!-- omit in toc -->

This document defines the engineering conventions used throughout the Commerce Intelligence monorepo.

These conventions are mandatory unless an architectural decision explicitly states otherwise.

## Table of Contents <!-- omit in toc -->

- [General Principles](#general-principles)
- [Naming](#naming)
  - [Packages](#packages)
  - [Files](#files)
  - [Folders](#folders)
  - [Variables](#variables)
  - [Constants](#constants)
  - [Types](#types)
  - [Generic Types](#generic-types)
- [Barrel Files](#barrel-files)
- [TypeScript](#typescript)
  - [Type Assertions](#type-assertions)
  - [Any](#any)
  - [Unknown](#unknown)
  - [Enums](#enums)
- [React](#react)
- [Hooks](#hooks)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Git](#git)
- [Pull Requests](#pull-requests)

## General Principles

The repository follows a small set of guiding principles.

* Consistency over personal preference.
* Readability over cleverness.
* Explicitness over implicit behavior.
* Composition over inheritance.
* Public APIs before implementation details.
* Small modules over large abstractions.

Whenever a decision is unclear, choose the option that improves long-term maintainability.

## Naming

### Packages

Packages use lowercase kebab-case.

Good

```text
shared
runtime
commerce
simulation
config-env
config-typescript
```

Avoid

```text
Shared
SharedUtils
shared_utils
```

### Files

Files use lowercase kebab-case.

Good

```text
pricing.service.ts
pricing.types.ts
pricing.constants.ts
pricing.error.ts
pricing.test.ts
```

Avoid

```text
PricingService.ts
pricingService.ts
types.ts
service.ts
helper.ts
```

File names should remain meaningful when viewed independently.

### Folders

Folders represent domains or features.

Good

```text
pricing
inventory
promotion
orders
analytics
```

Avoid

```text
helpers
common
misc
stuff
utilities
```

A folder name should describe what the code does, not what kind of file it contains.

### Variables

Use descriptive camelCase names.

Good

```ts
totalPrice
availableStock
retryCount
```

Avoid

```ts
tp
s
tmp
value2
```

Single-letter variables are acceptable only for very small scopes such as loop indices.

### Constants

Constants use PascalCase only when exporting objects or classes.

Primitive constants use UPPER_SNAKE_CASE.

```ts
const MAX_RETRY_COUNT = 3;

const DEFAULT_TIMEOUT = 5000;
```

### Types

Interfaces, types, enums, and classes use PascalCase.

```ts
Product

PricingRule

OrderStatus

CacheEntry
```

### Generic Types

Prefer meaningful generic names.

Good

```ts
TItem

TResult

TError

TContext
```

Avoid

```ts
T

U

V
```

except for very small utility types.

## Barrel Files

Barrel files are allowed only for public API composition.

Good

```text
pricing/

index.ts

pricing.service.ts
pricing.types.ts
pricing.error.ts
```

Avoid creating barrel files in every directory without a clear purpose.

## TypeScript

Strict mode is mandatory.

Do not disable compiler checks to satisfy a temporary implementation.

### Type Assertions

Avoid assertions whenever possible.

Prefer

```ts
const result = schema.parse(input);
```

instead of

```ts
const result = input as Result;
```

### Any

`any` is prohibited except when interoperating with external APIs that cannot be typed reasonably.

If `any` is required, document why.

### Unknown

Prefer `unknown` over `any`.

Validate unknown values before use.

### Enums

Prefer union types over enums unless runtime behavior is required.

Good

```ts
type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'completed';
```

## React

React components use PascalCase.

```text
ProductCard.tsx
DashboardLayout.tsx
```

Component directories follow:

```text
ProductCard/

  ProductCard.tsx
  ProductCard.test.tsx
  index.ts
```

Avoid deeply nested component hierarchies.

Business logic should not live inside components.

## Hooks

Hooks begin with `use`.

```text
useInventory.ts
usePricing.ts
```

Hooks should encapsulate reusable UI behavior, not domain rules.

## Error Handling

Throw typed errors.

Prefer

```ts
throw new PricingError(...)
```

over

```ts
throw new Error(...)
```

when the error belongs to a business domain.

Unexpected infrastructure failures may use standard `Error`.

## Logging

Applications should not log directly to the console except during development.

Use runtime logging abstractions.

Preferred

```ts
logger.info(...)
```

Avoid

```ts
console.log(...)
```

## Git

Branch names:

```text
feature/*
fix/*
refactor/*
docs/*
build/*
test/*
ci/*
chore/*
```

Commits follow Conventional Commits.

Examples

```text
feat(commerce): support tiered pricing

fix(runtime): prevent cache corruption

docs(architecture): clarify dependency rules
```

## Pull Requests

A pull request should:

* solve one primary problem;
* remain reviewable;
* include tests for behavior changes;
* update documentation when needed;
* avoid unrelated refactoring.

Large changes should be split into smaller pull requests.
