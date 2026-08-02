# TypeScript Configuration

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan bagaimana konfigurasi TypeScript dikelola di dalam repository.

Repository menggunakan pendekatan **shared configuration package**, sehingga seluruh project memperoleh konfigurasi dari satu sumber yang sama.

Tujuan utama pendekatan ini adalah menjaga konsistensi konfigurasi sekaligus mengurangi duplikasi.

---

# Scope

Dokumen ini berlaku untuk seluruh project yang menggunakan TypeScript.

Mencakup:

- applications
- shared packages
- shared TypeScript configuration
- konfigurasi editor

Dokumen ini tidak membahas aturan penulisan TypeScript maupun struktur package.

---

# Background

Pada repository yang memiliki banyak project, setiap project sering memiliki salinan `tsconfig.json` sendiri.

Pendekatan tersebut menimbulkan beberapa masalah.

- konfigurasi mudah berbeda
- perubahan harus dilakukan di banyak tempat
- onboarding menjadi lebih sulit
- review konfigurasi menjadi tidak konsisten

Repository memilih menggunakan konfigurasi bersama agar seluruh project mengikuti standar yang sama.

---

# Architecture Overview

Konfigurasi TypeScript dipisahkan menjadi package tersendiri.

```text
packages/

    config-typescript/
```

Seluruh project menggunakan package tersebut sebagai sumber konfigurasi.

Repository hanya memiliki satu source of truth untuk konfigurasi TypeScript.

---

# Repository Structure

Package konfigurasi memiliki struktur berikut.

```text
packages/

└── config-typescript/

    package.json

    base.json

    node.json

    react.json

    library.json
```

Setiap file memiliki tanggung jawab yang berbeda.

---

# Configuration Layers

Repository membagi konfigurasi menjadi beberapa layer.

## base.json

Konfigurasi dasar yang digunakan oleh konfigurasi lain.

Berisi pengaturan umum yang berlaku untuk seluruh project.

---

## node.json

Konfigurasi untuk project Node.js.

Digunakan oleh backend service maupun tooling.

---

## react.json

Konfigurasi untuk aplikasi dan package React.

---

## library.json

Konfigurasi untuk reusable library.

---

# Configuration Ownership

Seluruh perubahan konfigurasi dilakukan pada package berikut.

```text
packages/config-typescript
```

Project lain tidak boleh mendefinisikan ulang konfigurasi yang sudah tersedia di package tersebut.

---

# Project Configuration

Setiap project memiliki `tsconfig.json` sendiri.

Namun file tersebut hanya bertugas memilih konfigurasi yang sesuai.

Contoh.

```json
{
    "extends": "@my/config-typescript/react.json"
}
```

atau

```json
{
    "extends": "@my/config-typescript/node.json"
}
```

Dengan demikian konfigurasi tetap terpusat.

---

# Root Configuration

Repository tetap memiliki satu `tsconfig.json` pada root.

```text
tsconfig.json
```

File ini bukan source of truth konfigurasi project.

Fungsinya adalah sebagai konfigurasi tingkat repository, misalnya untuk editor dan solution references.

Konfigurasi compiler tetap berasal dari package `config-typescript`.

---

# Design Decisions

## Shared Configuration Package

Konfigurasi diperlakukan sebagai reusable package.

Dengan demikian konfigurasi dapat digunakan oleh seluruh project tanpa penyalinan.

---

## Layered Configuration

Konfigurasi dipisahkan berdasarkan kebutuhan.

Repository tidak menggunakan satu file besar yang mencakup seluruh skenario.

---

## Single Source of Truth

Perubahan konfigurasi dilakukan di satu lokasi.

Seluruh consumer memperoleh perubahan tersebut secara otomatis.

---

# Standards

Repository menerapkan aturan berikut.

## Rule 1

Seluruh project TypeScript harus menggunakan konfigurasi dari `@my/config-typescript`.

---

## Rule 2

Konfigurasi umum tidak boleh disalin ke project.

---

## Rule 3

Konfigurasi baru hanya ditambahkan jika memiliki tanggung jawab yang jelas.

---

## Rule 4

Perubahan konfigurasi bersama harus mempertimbangkan seluruh consumer.

---

# Trade-offs

Keuntungan.

- konfigurasi konsisten
- tidak ada duplikasi
- maintenance lebih sederhana
- onboarding lebih mudah

Konsekuensi.

- perubahan konfigurasi memengaruhi banyak project
- konfigurasi bersama harus dijaga kompatibilitasnya
- penambahan preset memerlukan evaluasi

---

# Best Practices

- Gunakan preset yang paling sesuai.
- Hindari override tanpa kebutuhan yang jelas.
- Perlakukan konfigurasi sebagai bagian dari arsitektur repository.
- Dokumentasikan perubahan besar melalui ADR apabila mengubah arah arsitektur.

---

# Anti-patterns

- Menyalin isi preset ke setiap project.
- Membuat preset baru untuk satu kasus khusus tanpa consumer lain.
- Mengubah konfigurasi lokal sehingga berbeda dari standar repository.
- Menjadikan root `tsconfig.json` sebagai tempat konfigurasi seluruh project.

---

# Review Checklist

- [ ] Project menggunakan preset resmi.
- [ ] Tidak ada duplikasi konfigurasi.
- [ ] Konfigurasi tetap memiliki satu source of truth.
- [ ] Preset baru memiliki tanggung jawab yang jelas.
- [ ] Root `tsconfig.json` tidak mengambil alih peran package konfigurasi.

---

# FAQ

## Mengapa konfigurasi dipindahkan menjadi package?

Agar konfigurasi dapat dipakai ulang dan dikelola dari satu lokasi.

---

## Mengapa tidak menggunakan satu `tsconfig.json` untuk seluruh project?

Karena setiap jenis project memiliki kebutuhan yang berbeda, tetapi tetap dapat berbagi konfigurasi dasar melalui preset.

---

## Apakah project boleh memiliki `tsconfig.json` sendiri?

Ya.

Namun file tersebut hanya berfungsi memilih atau melengkapi preset yang disediakan oleh `@my/config-typescript`.

