# Create a React Application

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Guide

---

# Purpose

Dokumen ini menjelaskan prosedur standar untuk membuat React application baru di dalam repository.

Panduan ini memastikan seluruh application memiliki struktur, konfigurasi, dan workflow yang konsisten.

---

# Prerequisites

Sebelum membuat application, pahami dokumen berikut.

- Engineering Principles
- Source-first Development
- Workspace Architecture
- Shared Packages
- Dependency Management
- TypeScript Configuration
- Build, Deploy, and Publish

---

# When to Create an Application

Application dibuat ketika software memiliki.

- entry point
- deployment target
- runtime sendiri
- lifecycle deployment sendiri

Application bukan reusable package.

Jika kode akan digunakan oleh lebih dari satu application, buat package terlebih dahulu.

---

# Step 1 — Define the Application

Tentukan.

- tujuan application
- deployment target
- consumer utama
- dependency terhadap shared package

Application harus memiliki tanggung jawab yang jelas.

---

# Step 2 — Create the Directory

Seluruh application dibuat pada direktori berikut.

```text
apps/

    application-name/
```

Repository tidak membuat application di lokasi lain.

---

# Step 3 — Create the Initial Structure

Gunakan struktur standar.

```text
application-name/

├── src/
│
├── public/
│
├── package.json
│
├── tsconfig.json
│
├── vite.config.ts
│
└── README.md
```

Struktur tambahan dibuat sesuai kebutuhan application.

---

# Step 4 — Configure package.json

Minimal.

- name
- private
- scripts

Application bukan reusable package.

Application tidak dipublish.

---

# Step 5 — Configure TypeScript

Gunakan preset React.

```text
@my/config-typescript/react.json
```

Jangan menduplikasi konfigurasi compiler.

---

# Step 6 — Configure Environment

Gunakan package environment repository.

Application tidak membuat mekanisme validasi sendiri.

Seluruh runtime configuration berasal dari package konfigurasi.

---

# Step 7 — Add Shared Packages

Tambahkan package yang memang diperlukan.

Contoh.

- UI
- Utilities
- Types

Gunakan dependency melalui workspace.

Jangan mengakses implementasi internal package.

---

# Step 8 — Configure Development Scripts

Application menyediakan minimal task berikut.

```text
dev

build

typecheck

lint

test
```

Implementasi task mengikuti standar repository.

---

# Step 9 — Verify the Architecture

Pastikan.

- application tidak menjadi reusable library
- dependency mengikuti dependency matrix
- seluruh import menggunakan public API
- tidak terdapat circular dependency

---

# Validation Checklist

Sebelum application digunakan.

- [ ] Berada di dalam `apps/`
- [ ] Menggunakan preset TypeScript resmi
- [ ] Menggunakan shared environment configuration
- [ ] Menggunakan shared package melalui public API
- [ ] Memiliki README
- [ ] Mengikuti workflow Turborepo
- [ ] Lolos typecheck
- [ ] Lolos lint
- [ ] Lolos test

---

# Common Mistakes

## Business Logic di Application

Business logic yang reusable sebaiknya dipindahkan menjadi package.

---

## Internal Package Import

Jangan melakukan import ke module internal package.

Gunakan public API.

---

## Duplicate Utilities

Jangan membuat utility baru apabila repository telah memiliki package yang sesuai.

---

## Custom Configuration

Jangan menduplikasi konfigurasi TypeScript maupun environment.

Gunakan konfigurasi bersama.

---

# Troubleshooting

## Shared Package Tidak Dapat Diimport

Periksa.

- workspace dependency
- package name
- public exports

---

## TypeScript Error

Pastikan application menggunakan preset resmi repository.

---

## Environment Tidak Valid

Pastikan runtime configuration berasal dari package environment repository.

