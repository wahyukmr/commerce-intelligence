# Create a Package

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Guide

---

# Purpose

Dokumen ini menjelaskan prosedur standar untuk membuat package baru di dalam repository.

Panduan ini memastikan seluruh package memiliki struktur, konfigurasi, dan boundary yang konsisten.

---

# Prerequisites

Sebelum membuat package, pahami dokumen berikut.

- Engineering Principles
- Workspace Architecture
- Shared Packages
- Dependency Management
- Package Exports

---

# When to Create a Package

Package baru dibuat apabila muncul domain reusable yang memenuhi seluruh kriteria berikut.

- memiliki satu tanggung jawab
- dapat digunakan lebih dari satu consumer
- memiliki public API yang jelas
- memiliki lifecycle yang independen

Jika kebutuhan hanya bersifat lokal pada satu application, jangan membuat package baru.

---

# Step 1 — Define the Responsibility

Sebelum membuat folder.

Tuliskan satu kalimat berikut.

> Package ini bertanggung jawab untuk ...

Jika kalimat tersebut tidak dapat dibuat dengan jelas, package belum layak dibuat.

Contoh.

```
@my/utils

Bertanggung jawab menyediakan reusable utility functions.
```

---

# Step 2 — Choose the Correct Package Type

Tentukan kategori package.

Runtime Package.

- utility
- UI
- runtime configuration

Development Package.

- TypeScript configuration
- lint configuration
- tooling

Kategori package menentukan dependency dan lifecycle.

---

# Step 3 — Create the Directory

Seluruh package dibuat pada direktori berikut.

```text
packages/

    package-name/
```

Repository tidak membuat package di lokasi lain.

---

# Step 4 — Create the Initial Structure

Gunakan struktur standar.

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

Struktur ini menjadi baseline seluruh package.

File tambahan ditambahkan hanya jika memang diperlukan.

---

# Step 5 — Configure package.json

Minimal package memiliki.

- name
- version
- private
- exports

Package identity harus unik.

Nama package merupakan kontrak publik.

---

# Step 6 — Configure TypeScript

Gunakan preset resmi repository.

Contoh.

```
@my/config-typescript/library.json
```

Jangan menyalin konfigurasi TypeScript ke package.

---

# Step 7 — Define the Public API

Seluruh consumer hanya boleh mengakses.

```
src/index.ts
```

File tersebut menjadi public API package.

Module internal tidak diekspor.

---

# Step 8 — Add Dependencies

Tambahkan dependency hanya jika benar-benar diperlukan.

Evaluasi.

- runtime
- development
- peer
- workspace

Ikuti aturan pada dokumen Dependency Management.

---

# Step 9 — Verify the Boundary

Pastikan package.

- memiliki satu tanggung jawab
- tidak mengetahui implementasi internal package lain
- hanya menggunakan public API consumer

---

# Step 10 — Integrate the Package

Tambahkan package ke consumer yang membutuhkan.

Consumer hanya menggunakan public API package.

Jangan mengakses module internal.

---

# Validation Checklist

Sebelum package dianggap selesai.

- [ ] Memiliki satu domain.
- [ ] Menggunakan struktur standar.
- [ ] Menggunakan preset TypeScript resmi.
- [ ] Memiliki public API.
- [ ] Dependency mengikuti dependency matrix.
- [ ] Tidak memiliki circular dependency.
- [ ] README tersedia.
- [ ] Package dapat digunakan oleh consumer.

---

# Common Mistakes

## Package Created Too Early

Package dibuat sebelum memiliki consumer.

Tunggu hingga benar-benar ada domain reusable.

---

## Multiple Responsibilities

Package menangani lebih dari satu domain.

Pisahkan menjadi package yang berbeda.

---

## Internal Import

Consumer mengakses module internal.

Gunakan public API.

---

## Copying Configuration

Menyalin konfigurasi dari package lain.

Gunakan shared configuration.

---

# Troubleshooting

## Package tidak terdeteksi workspace

Periksa lokasi package.

Package harus berada di dalam.

```text
packages/
```

---

## Consumer tidak dapat melakukan import

Periksa.

- package name
- exports
- workspace dependency

---

## Dependency menjadi circular

Review kembali dependency matrix.

Pisahkan responsibility package.

