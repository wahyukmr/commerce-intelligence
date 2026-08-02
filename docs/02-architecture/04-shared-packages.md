# Shared Packages

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan arsitektur **shared packages** yang digunakan di dalam repository.

Shared package merupakan unit reuse utama pada repository. Seluruh reusable code ditempatkan di dalam package dengan boundary yang jelas sehingga dapat digunakan oleh lebih dari satu application.

Dokumen ini menjelaskan bagaimana shared package dirancang dan bagaimana hubungan antar package dibentuk.

Dokumen ini tidak mendokumentasikan implementasi masing-masing package.

---

# Scope

Dokumen ini berlaku untuk seluruh package di bawah direktori:

```text
packages/
```

Mencakup:

- package boundary
- package responsibility
- package lifecycle
- package ownership
- package classification

Dokumen ini tidak membahas dependency rules maupun public API.

---

# Background

Tanpa package boundary yang jelas, reusable code cenderung berkembang menjadi kumpulan utility yang sulit dipahami.

Akibatnya.

- dependency tidak terkendali
- ownership menjadi kabur
- perubahan sulit diprediksi
- reuse menurun

Repository menggunakan package sebagai unit arsitektur utama.

---

# Architecture Overview

Repository membedakan dua jenis project.

```text
Repository

├── Applications
└── Shared Packages
```

Application menggunakan package.

Package tidak mengetahui application.

---

# Package Boundary

Package merupakan boundary arsitektur.

Boundary memisahkan.

- responsibility
- lifecycle
- dependency
- public API
- ownership

Seluruh komunikasi antar package dilakukan melalui public API.

Implementasi internal tidak boleh diakses secara langsung.

---

# Package Classification

Repository menggunakan dua kategori package.

## Runtime Packages

Berisi kode yang digunakan saat aplikasi berjalan.

Contoh.

- utilities
- UI components
- runtime configuration

Runtime package menghasilkan perilaku aplikasi.

---

## Development Packages

Berisi tooling yang mendukung proses development.

Contoh.

- shared TypeScript configuration
- lint configuration
- build configuration

Development package tidak menjadi bagian dari runtime aplikasi.

---

# Package Responsibility

Setiap package memiliki satu tanggung jawab utama.

Tanggung jawab package harus dapat dijelaskan dalam satu kalimat.

Jika sebuah package memiliki lebih dari satu domain, package tersebut perlu dievaluasi kembali.

---

# Package Identity

Setiap package memiliki identitas unik.

Identitas tersebut ditentukan oleh field `name` pada `package.json`.

Nama package merupakan kontrak publik.

Perubahan nama package dianggap sebagai perubahan arsitektur.

---

# Package Ownership

Setiap package memiliki owner.

Owner bertanggung jawab terhadap.

- desain
- maintenance
- review perubahan
- compatibility
- public API

Ownership memastikan keputusan terhadap package tetap konsisten.

---

# Package Lifecycle

Shared package memiliki lifecycle berikut.

```text
Design

↓

Implementation

↓

Consumption

↓

Maintenance

↓

Evolution

↓

Deprecation
```

Package dirancang untuk berevolusi tanpa mengganggu consumer yang ada.

---

# Package Independence

Package merupakan unit yang berdiri sendiri.

Package tidak boleh bergantung pada implementasi internal package lain.

Interaksi hanya dilakukan melalui public API.

---

# Reusability

Sebuah package dibuat ketika terdapat domain yang layak digunakan kembali.

Repository tidak membuat package hanya karena ingin memecah folder.

Reuse merupakan tujuan.

Fragmentasi bukan.

---

# Design Decisions

## Package as Architecture

Repository menggunakan package sebagai unit arsitektur utama.

Bukan folder.

---

## Explicit Responsibility

Setiap package memiliki domain yang jelas.

---

## Stable Public Interface

Consumer bergantung pada kontrak, bukan implementasi.

---

## Independent Evolution

Package harus dapat berkembang tanpa memaksa perubahan pada seluruh repository.

---

# Standards

## Rule 1

Setiap package memiliki satu tanggung jawab.

---

## Rule 2

Setiap package memiliki public API.

---

## Rule 3

Package tidak boleh menjadi dumping ground.

---

## Rule 4

Package hanya dibuat jika memiliki domain yang jelas.

---

## Rule 5

Package tidak boleh mengetahui implementasi internal package lain.

---

# Trade-offs

Keuntungan.

- reuse meningkat
- maintenance lebih mudah
- dependency lebih terkendali
- ownership lebih jelas

Konsekuensi.

- membutuhkan desain boundary yang baik
- package yang terlalu kecil dapat meningkatkan kompleksitas
- perubahan public API memerlukan perhatian khusus

---

# Best Practices

- Gunakan package untuk domain, bukan berdasarkan ukuran kode.
- Jaga public API tetap kecil dan stabil.
- Hindari dependency yang tidak diperlukan.
- Dokumentasikan perubahan besar melalui ADR.

---

# Anti-patterns

- Package tanpa tanggung jawab yang jelas.
- Utility package yang berisi segala jenis kode.
- Mengakses implementasi internal package lain.
- Membuat package baru untuk satu file.
- Menggabungkan beberapa domain berbeda dalam satu package.

---

# Review Checklist

- [ ] Package memiliki satu domain.
- [ ] Public API jelas.
- [ ] Boundary tetap terjaga.
- [ ] Tidak ada akses ke implementasi internal package lain.
- [ ] Package benar-benar reusable.

---

# FAQ

## Mengapa repository menggunakan package sebagai unit arsitektur?

Karena package menyediakan boundary yang jelas untuk dependency, ownership, lifecycle, dan public API.

---

## Kapan sebuah package baru dibuat?

Ketika muncul domain reusable yang memiliki tanggung jawab tersendiri.

---

## Apakah setiap folder harus menjadi package?

Tidak.

Package dibentuk berdasarkan domain, bukan struktur folder.

