# Glossary

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Reference

---

# Purpose

Dokumen ini menjadi kamus resmi istilah yang digunakan di seluruh handbook dan repository.

Seluruh definisi pada dokumen ini merupakan referensi utama. Dokumen lain dapat menggunakan istilah yang sama tanpa mendefinisikannya kembali.

---

# Quick Lookup

| Term | Definition |
|------|------------|
| Application | Software yang memiliki entry point dan deployment target sendiri. |
| Artifact | Hasil build yang digunakan untuk distribusi atau deployment. |
| Boundary | Batas resmi yang memisahkan tanggung jawab suatu komponen. |
| Build | Proses mengubah source menjadi artifact. |
| Consumer | Application atau package yang menggunakan package lain. |
| Dependency | Hubungan ketika suatu komponen membutuhkan komponen lain. |
| Deploy | Proses mengirim artifact ke runtime environment. |
| Distribution | Proses menyediakan software kepada consumer melalui deploy atau publish. |
| Export | Public entry point yang disediakan package. |
| Internal Module | Module yang bukan bagian dari public API. |
| Layer | Tingkatan arsitektur berdasarkan dependency direction. |
| Package | Unit reusable dengan tanggung jawab tertentu. |
| Pipeline | Urutan eksekusi task dalam workflow repository. |
| Public API | Bagian package yang secara resmi didukung untuk digunakan consumer. |
| Publish | Proses mendistribusikan package agar dapat digunakan repository lain. |
| Runtime | Lingkungan tempat application berjalan. |
| Source | Kode asli yang menjadi source of truth. |
| Task | Aktivitas seperti build, test, lint, atau typecheck. |
| Workspace | Kumpulan project yang dikelola dalam satu repository. |

---

# Core Concepts

## Application

Unit software yang dijalankan atau di-deploy sebagai produk akhir.

Application berada pada layer tertinggi dalam repository.

---

## Package

Unit reusable yang menyediakan fungsi atau layanan bagi consumer.

Package bukan deployment unit.

---

## Workspace

Sekumpulan application dan package yang dikelola sebagai satu repository.

---

## Source

Kode asli yang dikelola oleh developer.

Source merupakan source of truth repository.

---

## Artifact

Output yang dihasilkan dari proses build.

Artifact digunakan untuk deployment atau publishing.

Artifact bukan source of truth.

---

# Distribution Terms

## Build

Menghasilkan artifact dari source.

---

## Deploy

Mengirim artifact ke environment tempat application dijalankan.

---

## Publish

Mendistribusikan package agar dapat digunakan oleh repository lain.

---

## Distribution

Istilah umum yang mencakup deploy maupun publish.

---

# Architecture Terms

## Layer

Tingkatan arsitektur berdasarkan dependency direction.

---

## Boundary

Batas resmi antara dua komponen.

Boundary mencegah coupling terhadap implementasi internal.

---

## Public API

Kontrak resmi antara package dan consumer.

Semua komunikasi antar package dilakukan melalui public API.

---

## Internal Module

Module yang hanya digunakan oleh package itu sendiri.

Module ini dapat berubah tanpa pemberitahuan kepada consumer.

---

## Consumer

Application atau package yang menggunakan public API package lain.

---

## Dependency

Hubungan penggunaan antara dua komponen.

Repository hanya memperbolehkan dependency sesuai dependency matrix.

---

# Development Terms

## Task

Aktivitas yang dapat dijalankan sebagai bagian dari workflow repository.

Contoh.

- build
- test
- lint
- typecheck
- dev

---

## Pipeline

Hubungan dan urutan eksekusi antar task.

Pipeline dikelola oleh task orchestrator.

---

## Runtime

Lingkungan tempat application dieksekusi.

Berbeda dengan development environment maupun build environment.

