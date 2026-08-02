# Package Exports

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan bagaimana package mengekspos fungsionalitasnya kepada consumer.

Repository menggunakan **public API** sebagai satu-satunya jalur komunikasi antar package.

Implementasi internal dianggap sebagai detail dan tidak menjadi bagian dari kontrak package.

---

# Scope

Dokumen ini berlaku untuk seluruh reusable package.

Mencakup:

- public API
- package boundary
- package exports
- consumer access

Dokumen ini tidak membahas dependency antar package maupun implementasi internal package.

---

# Background

Package merupakan unit arsitektur utama repository.

Tanpa boundary yang jelas, consumer dapat bergantung pada struktur internal package.

Akibatnya.

- refactoring menjadi sulit
- implementasi internal menjadi kontrak tidak resmi
- breaking change meningkat
- coupling bertambah

Repository menggunakan **package exports** untuk menjaga boundary tersebut.

---

# Architecture Overview

Interaksi antar package selalu melalui public API.

```text
Consumer

↓

Public API

↓

Package

↓

Internal Implementation
```

Consumer tidak mengetahui bagaimana package diimplementasikan.

Consumer hanya mengetahui kontrak yang disediakan package.

---

# Public API

Public API merupakan kumpulan module yang secara resmi didukung oleh package.

Public API menjadi kontrak antara package dan consumer.

Selama kontrak tetap sama, implementasi internal dapat berubah tanpa memengaruhi consumer.

---

# Package Boundary

Boundary package berada pada public API.

```text
Package

├── Public API
│
└── Internal Modules
```

Hanya public API yang boleh digunakan oleh package lain.

Internal module bukan bagian dari kontrak.

---

# Export Strategy

Repository menggunakan explicit export.

Package secara eksplisit menentukan module mana yang dapat digunakan consumer.

Module yang tidak diekspor dianggap internal.

Pendekatan ini membuat boundary package tetap jelas.

---

# Root Export

Setiap package menyediakan root export.

Contoh secara konseptual.

```text
@my/package
```

Root export menjadi titik masuk utama package.

Consumer sebaiknya menggunakan root export sebagai pilihan pertama.

---

# Subpath Export

Package dapat menyediakan subpath export apabila terdapat kebutuhan arsitektural yang jelas.

Contoh.

```text
@my/package/testing

@my/package/server
```

Subpath export tetap merupakan bagian dari public API.

Subpath tidak boleh digunakan hanya untuk mencerminkan struktur folder.

---

# Internal Modules

Module internal.

- bukan public API
- dapat berubah kapan saja
- tidak memiliki compatibility guarantee

Consumer tidak boleh bergantung pada module internal.

---

# Package Evolution

Package dapat mengubah implementasi internal tanpa memengaruhi consumer.

Perubahan berikut tidak dianggap breaking change.

- reorganisasi folder
- refactoring
- optimisasi internal

Selama public API tetap sama.

---

# Breaking Changes

Perubahan berikut dianggap breaking change.

- menghapus export publik
- mengubah nama export
- mengubah kontrak public API
- menghapus subpath export publik

Perubahan tersebut memerlukan evaluasi compatibility.

---

# Design Decisions

## Public API First

Consumer bergantung pada kontrak.

Bukan implementasi.

---

## Explicit Boundary

Boundary package ditentukan secara eksplisit.

---

## Internal Freedom

Package bebas berevolusi di balik public API.

---

# Standards

## Rule 1

Consumer hanya menggunakan public API.

---

## Rule 2

Internal module tidak boleh diimpor secara langsung.

---

## Rule 3

Seluruh export harus didefinisikan secara eksplisit.

---

## Rule 4

Breaking change terhadap public API harus dievaluasi sebelum diterapkan.

---

## Rule 5

Struktur folder bukan bagian dari kontrak package.

---

# Trade-offs

Keuntungan.

- boundary lebih jelas
- refactoring lebih aman
- coupling lebih rendah
- maintenance lebih mudah

Konsekuensi.

- public API harus dirancang dengan baik
- perubahan kontrak memerlukan perhatian lebih
- export baru memerlukan evaluasi

---

# Best Practices

- Jadikan root export sebagai titik masuk utama.
- Tambahkan subpath export hanya jika memiliki domain yang jelas.
- Perlakukan public API sebagai kontrak jangka panjang.
- Pertahankan implementasi internal tetap tersembunyi.

---

# Anti-patterns

- Mengimpor module internal.
- Mengekspor seluruh struktur folder.
- Menjadikan struktur direktori sebagai public API.
- Menambahkan export tanpa consumer yang jelas.

---

# Review Checklist

- [ ] Consumer hanya menggunakan public API.
- [ ] Internal module tetap tersembunyi.
- [ ] Export baru memiliki tujuan yang jelas.
- [ ] Public API tetap kecil dan stabil.
- [ ] Breaking change telah dievaluasi.

---

# FAQ

## Mengapa tidak boleh mengimpor module internal?

Karena module internal bukan bagian dari kontrak package dan dapat berubah kapan saja.

---

## Kapan subpath export digunakan?

Ketika terdapat domain publik yang memang layak dipisahkan, bukan sekadar mengikuti struktur folder.

---

## Apakah semua file harus diekspor?

Tidak.

Hanya module yang menjadi bagian dari public API.
