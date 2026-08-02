# Environment Configuration

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan arsitektur pengelolaan environment configuration pada repository.

Repository menggunakan package bersama untuk melakukan validasi dan pengelolaan environment variable sehingga seluruh project mengikuti mekanisme yang konsisten.

Tujuan utama pendekatan ini adalah memastikan konfigurasi runtime tervalidasi sebelum digunakan oleh aplikasi.

---

# Scope

Dokumen ini berlaku untuk seluruh application dan package yang membutuhkan environment variable.

Mencakup:

- runtime configuration
- environment validation
- shared environment package
- ownership konfigurasi

Dokumen ini tidak mendefinisikan daftar environment variable milik setiap aplikasi.

---

# Background

Environment variable merupakan konfigurasi eksternal yang berubah sesuai environment tempat aplikasi dijalankan.

Contoh.

- development
- testing
- staging
- production

Tanpa validasi yang konsisten, kesalahan konfigurasi sering baru ditemukan ketika aplikasi telah berjalan.

Repository memilih memusatkan validasi environment agar seluruh project menggunakan mekanisme yang sama.

---

# Architecture Overview

Environment configuration dikelola oleh satu package.

```text
packages/

    config-env/
```

Package ini menjadi source of truth untuk mekanisme validasi runtime.

Application tidak melakukan validasi dengan caranya sendiri.

---

# Responsibilities

Package `config-env` bertanggung jawab untuk:

- memuat konfigurasi runtime
- melakukan validasi
- menghasilkan konfigurasi yang telah tervalidasi
- menyediakan antarmuka yang konsisten bagi consumer

Package ini tidak bertanggung jawab terhadap logika bisnis aplikasi.

---

# Runtime Configuration

Environment variable merupakan bagian dari runtime configuration.

Repository membedakan dua jenis konfigurasi.

## Build Configuration

Digunakan saat proses build.

---

## Runtime Configuration

Digunakan ketika aplikasi dijalankan.

Environment variable termasuk kategori runtime configuration.

---

# Validation Strategy

Repository menerapkan prinsip **Fail Fast**.

Konfigurasi harus divalidasi sedini mungkin.

Jika konfigurasi tidak valid, aplikasi harus gagal dijalankan daripada melanjutkan dalam kondisi yang tidak diketahui.

---

# Configuration Ownership

Validasi environment hanya dilakukan oleh package berikut.

```text
packages/config-env
```

Application menggunakan hasil validasi tersebut.

Dengan demikian:

- aturan validasi tidak diduplikasi
- perubahan dilakukan di satu lokasi
- perilaku seluruh aplikasi tetap konsisten

---

# Design Decisions

## Shared Runtime Package

Environment validation diperlakukan sebagai reusable package.

---

## Single Validation Strategy

Seluruh project menggunakan mekanisme validasi yang sama.

---

## Runtime First

Validasi dilakukan sebelum aplikasi mulai menjalankan logika bisnis.

---

# Standards

Repository menerapkan aturan berikut.

## Rule 1

Environment variable tidak boleh digunakan sebelum divalidasi.

---

## Rule 2

Validasi dilakukan melalui package `config-env`.

---

## Rule 3

Application tidak mendefinisikan mekanisme validasi baru tanpa alasan arsitektural.

---

## Rule 4

Perubahan terhadap aturan validasi dipusatkan pada package bersama.

---

# Dependency Model

Secara konseptual.

```text
Application

↓

config-env

↓

Runtime Environment
```

Application bergantung pada package konfigurasi.

Package konfigurasi berinteraksi dengan runtime environment.

---

# Trade-offs

Keuntungan.

- validasi konsisten
- konfigurasi terpusat
- lebih mudah dipelihara
- lebih mudah diuji

Konsekuensi.

- perubahan mekanisme validasi memengaruhi seluruh consumer
- package konfigurasi menjadi komponen penting repository

---

# Best Practices

- Validasi konfigurasi sebelum digunakan.
- Perlakukan environment sebagai input eksternal.
- Simpan seluruh aturan validasi pada package bersama.
- Pisahkan validasi dari logika bisnis.

---

# Anti-patterns

- Membaca environment variable secara langsung di banyak lokasi.
- Menyalin aturan validasi antar application.
- Menunda validasi hingga setelah aplikasi berjalan.
- Mencampurkan validasi konfigurasi dengan business logic.

---

# Review Checklist

- [ ] Environment telah divalidasi sebelum digunakan.
- [ ] Tidak ada duplikasi aturan validasi.
- [ ] Application menggunakan package `config-env`.
- [ ] Konfigurasi runtime terpisah dari business logic.
- [ ] Prinsip Fail Fast tetap dipenuhi.

---

# FAQ

## Mengapa validasi dipusatkan?

Agar seluruh aplikasi menggunakan aturan yang sama dan perubahan cukup dilakukan di satu lokasi.

---

## Apakah semua application harus menggunakan package ini?

Ya, apabila application menggunakan environment variable.

---

## Apakah package ini mengetahui logika bisnis aplikasi?

Tidak.

Package hanya bertanggung jawab terhadap konfigurasi runtime.

