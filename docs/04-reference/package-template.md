# Package Template

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Reference

---

# Purpose

Dokumen ini menyediakan template standar untuk reusable package di dalam repository.

Gunakan dokumen ini sebagai referensi cepat ketika membuat package baru atau melakukan review terhadap package yang sudah ada.

Untuk prosedur lengkap, lihat **Create a Package**.

---

# Quick Lookup

## Standard Location

```text
packages/
```

---

## Standard Structure

```text
package-name/

├── src/
│   └── index.ts
│
├── package.json
│
├── tsconfig.json
│
└── README.md
```

---

## Required Files

| File | Required | Purpose |
|------|:--------:|---------|
| `package.json` | ✅ | Package metadata |
| `tsconfig.json` | ✅ | TypeScript configuration |
| `src/index.ts` | ✅ | Public API |
| `README.md` | ✅ | Package documentation |

---

# Standard package.json

Minimal metadata.

```json
{
  "name": "@my/package-name",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Nilai dapat berubah sesuai kebutuhan repository, tetapi struktur dasarnya tetap konsisten.

---

# TypeScript Configuration

Gunakan preset resmi repository.

```text
extends

↓

@my/config-typescript/library.json
```

Jangan menyalin konfigurasi compiler ke setiap package.

---

# Public API

Entry point standar.

```text
src/index.ts
```

Seluruh consumer mengakses package melalui file ini.

---

# Directory Guidelines

| Directory | Purpose |
|-----------|---------|
| `src/` | Source code |
| `src/internal/` | Internal implementation |
| `src/testing/` | Testing utilities (optional) |
| `src/types/` | Package-specific types (optional) |

Direktori tambahan hanya dibuat apabila memiliki tanggung jawab yang jelas.

---

# Naming Rules

| Item | Convention |
|------|------------|
| Package | `kebab-case` |
| Directory | `kebab-case` |
| Source file | `kebab-case` |
| Type | `PascalCase` |
| Interface | `PascalCase` |
| Function | `camelCase` |
| Variable | `camelCase` |
| Constant | `UPPER_SNAKE_CASE` bila berupa compile-time constant, selain itu `camelCase` |

---

# Export Pattern

Valid.

```text
Consumer

↓

@my/package

↓

src/index.ts

↓

Internal Modules
```

Tidak valid.

```text
Consumer

↓

@my/package/src/internal
```

---

# Package Checklist

| Item | Required |
|------|:--------:|
| Single responsibility | ✅ |
| Public API | ✅ |
| README | ✅ |
| Shared TypeScript preset | ✅ |
| Dependency review | ✅ |
| No circular dependency | ✅ |
