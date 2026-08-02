# Workspace Architecture

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan bagaimana repository diorganisasikan sebagai sebuah **pnpm Workspace Monorepo**.

Workspace menjadi fondasi fisik dari repository. Seluruh application, shared package, tooling, dan workflow dibangun di atas struktur ini.

Dokumen ini menjelaskan **bagaimana repository diorganisasikan**, bukan cara menggunakan pnpm.

---

# Scope

Dokumen ini berlaku untuk seluruh repository.

Mencakup:

- struktur repository
- workspace boundaries
- package identity
- workspace discovery
- dependency graph tingkat repository

Dokumen ini tidak membahas:

- dependency rules antar package
- public API
- build system
- Turbo
- TypeScript configuration

Topik tersebut dijelaskan pada dokumen architecture lainnya.

---

# Background

Repository ini menggunakan pendekatan monorepo.

Semua application dan reusable package berada di dalam satu repository.

Pendekatan ini dipilih untuk:

- menyederhanakan dependency management
- meningkatkan code sharing
- menjaga konsistensi tooling
- mempermudah refactoring lintas package
- mengurangi duplikasi konfigurasi

Workspace menyediakan mekanisme untuk mengelola kumpulan project tersebut sebagai satu sistem.

---

# Architecture Overview

Repository dibagi menjadi dua domain utama.

```text
Repository

├── apps/
└── packages/
```

Kedua direktori memiliki tanggung jawab yang berbeda.

---

# Applications

Direktori `apps/` berisi executable software.

Karakteristik application.

- dapat dijalankan
- dapat dideploy
- memiliki entry point
- menggunakan shared package

Contoh.

```text
apps/

    web

    admin

    api
```

Application merupakan consumer.

Application bukan reusable library.

---

# Shared Packages

Direktori `packages/` berisi reusable module.

Karakteristik package.

- reusable
- memiliki public API
- tidak dideploy secara mandiri
- dapat digunakan lebih dari satu application

Contoh.

```text
packages/

    ui

    utils

    types

    config-env

    config-typescript
```

Package merupakan building block repository.

---

# Repository Structure

Struktur tingkat atas repository ditetapkan sebagai berikut.

```text
.

├── apps/
├── packages/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

Setiap direktori memiliki satu tanggung jawab utama.

---

# Workspace Discovery

Workspace didefinisikan melalui `pnpm-workspace.yaml`.

Repository hanya mengenali project yang berada pada lokasi workspace yang telah ditentukan.

Secara konseptual.

```text
apps/*

packages/*
```

Project di luar workspace tidak dianggap sebagai bagian dari repository.

---

# Package Identity

Setiap project di dalam workspace memiliki identitas yang unik.

Identitas package ditentukan oleh field `name` pada `package.json`.

Contoh.

```json
{
  "name": "@my/utils"
}
```

Nama package merupakan kontrak publik.

Perubahan nama package dianggap sebagai perubahan arsitektur karena memengaruhi seluruh consumer.

---

# Workspace Boundaries

Workspace hanya mengenal dua jenis project.

```text
Application

Package
```

Repository tidak mengenal kategori lain seperti:

- common
- shared2
- misc
- temp

Jika sebuah project tidak memiliki tanggung jawab yang jelas, project tersebut tidak boleh ditambahkan ke workspace.

---

# Repository Responsibilities

## apps/

Bertanggung jawab terhadap executable software.

---

## packages/

Bertanggung jawab terhadap reusable module.

---

## docs/

Bertanggung jawab terhadap dokumentasi engineering.

---

# Repository Dependency Graph

Secara konseptual.

```text
Repository

├── Applications
│
└── Packages
```

Hubungan dependency antar package dijelaskan pada dokumen **Dependency Management**.

Workspace hanya menentukan batas fisik repository.

---

# Standards

Repository harus memenuhi aturan berikut.

## Rule 1

Seluruh executable software berada di `apps/`.

---

## Rule 2

Seluruh reusable module berada di `packages/`.

---

## Rule 3

Seluruh package memiliki identitas unik.

---

## Rule 4

Seluruh package merupakan bagian dari workspace.

---

## Rule 5

Repository hanya memiliki satu workspace.

---

# Design Decisions

## Single Repository

Semua project berada dalam satu repository untuk mempermudah koordinasi perubahan.

---

## Explicit Separation

Application dan reusable package dipisahkan secara eksplisit.

---

## Stable Identity

Nama package diperlakukan sebagai kontrak.

---

# Trade-offs

Keuntungan.

- dependency mudah dikelola
- konfigurasi dapat dibagikan
- refactoring lintas package lebih sederhana
- onboarding lebih mudah

Konsekuensi.

- perubahan besar memerlukan koordinasi
- tooling harus mendukung monorepo
- repository menjadi lebih besar

---

# Best Practices

- Tambahkan project hanya jika memiliki tanggung jawab yang jelas.
- Pertahankan struktur tingkat atas tetap sederhana.
- Gunakan package sebagai unit reuse.
- Perlakukan nama package sebagai kontrak publik.

---

# Anti-patterns

- Menambahkan folder tingkat atas tanpa alasan arsitektural.
- Menggunakan package sebagai tempat kode sementara.
- Mengubah nama package tanpa migration plan.
- Menempatkan executable software di dalam `packages/`.
- Menempatkan reusable library di dalam `apps/`.

---

# Review Checklist

- [ ] Project berada pada direktori yang benar.
- [ ] Package memiliki nama yang unik.
- [ ] Repository structure tetap konsisten.
- [ ] Workspace boundary tetap jelas.
- [ ] Tidak muncul kategori project baru tanpa keputusan arsitektur.

---

# FAQ

## Mengapa hanya ada `apps/` dan `packages/`?

Karena repository hanya membedakan executable software dan reusable module. Kategori tambahan hanya ditambahkan jika memiliki tanggung jawab arsitektural yang berbeda.

---

## Apakah semua package harus reusable?

Ya. Jika hanya digunakan oleh satu application dan tidak memiliki potensi reuse, pertimbangkan untuk meletakkannya di dalam application tersebut.

---

## Mengapa struktur repository dibuat sederhana?

Karena struktur tingkat atas adalah navigasi utama repository. Semakin sedikit kategori yang digunakan, semakin mudah repository dipahami.

