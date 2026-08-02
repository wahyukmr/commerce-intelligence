# Create a Node Application

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Guide

---

# Purpose

Dokumen ini menjelaskan prosedur standar untuk membuat Node.js application baru di dalam repository.

Panduan ini memastikan seluruh Node application memiliki struktur, konfigurasi, dependency, dan workflow yang konsisten.

---

# Prerequisites

Sebelum membuat application, pahami dokumen berikut.

- Engineering Principles
- Source-first Development
- Workspace Architecture
- Shared Packages
- Dependency Management
- TypeScript Configuration
- Environment Configuration
- Build, Deploy, and Publish

---

# When to Create an Application

Node application dibuat ketika software memiliki.

- runtime Node.js
- entry point sendiri
- deployment target sendiri
- lifecycle deployment sendiri

Node application bukan reusable package.

Jika kode dapat digunakan oleh beberapa application, pindahkan ke shared package.

---

# Procedure

## Step 1 — Define the Application

Tentukan.

- tujuan application
- runtime
- deployment target
- dependency terhadap shared package

Application harus memiliki satu tanggung jawab utama.

---

## Step 2 — Create the Directory

Seluruh Node application dibuat pada.

```text
apps/

    application-name/
```

Repository tidak membuat application di lokasi lain.

---

## Step 3 — Create the Initial Structure

Gunakan struktur standar.

```text
application-name/

├── src/
│   └── index.ts
│
├── package.json
│
├── tsconfig.json
│
└── README.md
```

Tambahkan direktori lain hanya apabila diperlukan oleh domain application.

---

## Step 4 — Configure package.json

Minimal.

- name
- private
- scripts

Application bukan package yang dipublish.

---

## Step 5 — Configure TypeScript

Gunakan preset Node.

```text
@my/config-typescript/node.json
```

Seluruh konfigurasi compiler berasal dari shared configuration.

---

## Step 6 — Configure Environment

Gunakan package environment repository.

Application tidak membuat validasi environment secara mandiri.

Seluruh runtime configuration berasal dari shared environment package.

---

## Step 7 — Add Shared Packages

Tambahkan dependency sesuai kebutuhan.

Contoh.

- utilities
- shared types
- runtime configuration

Gunakan dependency melalui workspace.

Seluruh import dilakukan melalui public API.

---

## Step 8 — Configure Development Scripts

Application menyediakan minimal task berikut.

```text
dev

build

typecheck

lint

test
```

Task mengikuti standar repository dan dijalankan melalui Turborepo.

---

## Step 9 — Verify the Architecture

Pastikan.

- application tidak digunakan sebagai reusable package
- dependency mengikuti dependency matrix
- tidak ada circular dependency
- seluruh import menggunakan public API

---

# Validation Checklist

Sebelum application dianggap selesai.

- [ ] Berada di dalam `apps/`
- [ ] Menggunakan preset TypeScript Node
- [ ] Menggunakan shared environment configuration
- [ ] Menggunakan shared package melalui public API
- [ ] Memiliki README
- [ ] Mengikuti workflow Turborepo
- [ ] Lolos typecheck
- [ ] Lolos lint
- [ ] Lolos test

---

# Common Mistakes

## Business Logic Tetap Berada di Application

Logic yang reusable sebaiknya dipindahkan ke shared package.

---

## Import Module Internal

Application tidak boleh mengimpor module internal package.

Gunakan public API.

---

## Duplicate Configuration

Jangan membuat konfigurasi TypeScript atau environment baru.

Gunakan konfigurasi bersama.

---

## Dependency yang Tidak Diperlukan

Tambahkan dependency hanya apabila benar-benar dibutuhkan.

Ikuti dependency matrix repository.

---

# Troubleshooting

## Workspace Dependency Tidak Ditemukan

Periksa.

- nama package
- workspace dependency
- package exports

---

## TypeScript Tidak Menggunakan Preset

Pastikan application mewarisi preset Node resmi repository.

---

## Runtime Configuration Gagal

Pastikan seluruh environment berasal dari shared environment package.

