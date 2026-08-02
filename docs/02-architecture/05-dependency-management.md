# Dependency Management

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan aturan dependency antar project di dalam repository.

Tujuan utama dependency management adalah menjaga dependency graph tetap sederhana, dapat diprediksi, dan bebas dari circular dependency.

Dokumen ini tidak menjelaskan bagaimana package dibangun maupun bagaimana public API diekspos.

---

# Scope

Berlaku untuk seluruh project dalam workspace.

Mencakup:

- application dependency
- package dependency
- dependency direction
- dependency policy

Tidak mencakup:

- package exports
- build pipeline
- TypeScript configuration

---

# Background

Dependency merupakan hubungan paling penting dalam sebuah monorepo.

Tanpa aturan yang jelas, dependency graph akan berkembang secara organik hingga sulit dipahami.

Masalah yang umum terjadi.

- circular dependency
- hidden dependency
- dependency yang tidak diperlukan
- package saling mengetahui implementasi internal

Repository menetapkan aturan dependency agar perubahan tetap dapat diprediksi.

---

# Architecture Overview

Repository menerapkan dependency satu arah.

```text
Applications

▲

UI

▲

Utilities

▲

Types
```

Layer yang lebih tinggi boleh menggunakan layer di bawahnya.

Layer bawah tidak boleh mengetahui layer atas.

---

# Dependency Direction

Dependency selalu mengarah menuju layer yang lebih stabil.

Rule.

```text
Higher Layer

↓

Depends On

↓

Lower Layer
```

Dependency terbalik dianggap sebagai pelanggaran arsitektur.

---

# Allowed Dependencies

Repository menerapkan dependency matrix berikut.

| Consumer | May Depend On |
|----------|---------------|
| Applications | UI, Utilities, Types |
| UI | Utilities, Types |
| Utilities | Types |
| Types | — |

Dependency di luar aturan tersebut memerlukan evaluasi arsitektur.

---

# Dependency Types

Repository mengenal beberapa jenis dependency.

## Runtime Dependency

Dibutuhkan ketika aplikasi berjalan.

---

## Development Dependency

Hanya digunakan saat development atau build.

---

## Peer Dependency

Disediakan oleh consumer.

Package tidak menginstal dependency tersebut secara langsung.

---

## Workspace Dependency

Dependency menuju package lain di repository.

Workspace dependency digunakan untuk hubungan antar package internal.

---

# Dependency Principles

Seluruh dependency harus memenuhi prinsip berikut.

## Minimal

Tambahkan dependency hanya jika benar-benar dibutuhkan.

---

## Explicit

Dependency harus dideklarasikan secara eksplisit.

---

## Stable

Lebih baik bergantung pada package yang stabil daripada package yang sering berubah.

---

## Public

Dependency hanya melalui public API.

---

# Circular Dependencies

Circular dependency tidak diperbolehkan.

Contoh.

```text
Package A

↓

Package B

↓

Package A
```

Circular dependency membuat boundary menjadi tidak jelas.

---

# Dependency Graph

Dependency graph repository harus berbentuk Directed Acyclic Graph (DAG).

Karakteristik DAG.

- tidak memiliki cycle
- dependency memiliki arah
- urutan build dapat ditentukan
- dependency mudah dianalisis

---

# Design Decisions

## One-way Dependency

Dependency hanya memiliki satu arah.

---

## Stable Foundation

Layer paling bawah menjadi fondasi repository.

---

## Explicit Contracts

Dependency selalu menuju public API.

---

# Standards

## Rule 1

Dependency mengikuti dependency matrix.

---

## Rule 2

Circular dependency tidak diperbolehkan.

---

## Rule 3

Dependency hanya menuju public API.

---

## Rule 4

Dependency baru harus memiliki alasan yang jelas.

---

## Rule 5

Dependency yang tidak digunakan harus dihapus.

---

# Trade-offs

Keuntungan.

- dependency graph sederhana
- refactoring lebih aman
- maintenance lebih mudah

Konsekuensi.

- beberapa shortcut tidak dapat dilakukan
- boundary harus dipatuhi
- desain package memerlukan perhatian lebih

---

# Best Practices

- Tambahkan dependency sesedikit mungkin.
- Review dependency secara berkala.
- Gunakan package yang paling stabil.
- Hindari dependency lintas layer.

---

# Anti-patterns

- Circular dependency.
- Dependency demi kemudahan sementara.
- Bergantung pada implementasi internal package lain.
- Menambahkan dependency tanpa consumer yang jelas.

---

# Review Checklist

- [ ] Dependency mengikuti matrix.
- [ ] Tidak ada circular dependency.
- [ ] Public API tetap menjadi boundary.
- [ ] Dependency baru memiliki alasan yang jelas.
- [ ] Package tetap memiliki coupling yang rendah.

---

# FAQ

## Mengapa dependency harus satu arah?

Agar perubahan dapat diprediksi dan dependency graph tetap sederhana.

---

## Apakah semua dependency internal menggunakan workspace?

Ya.

Hubungan antar package di repository menggunakan workspace dependency.

---

## Apakah package boleh saling bergantung?

Boleh.

Selama mengikuti dependency matrix repository.

