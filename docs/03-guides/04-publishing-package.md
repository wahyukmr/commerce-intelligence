# Publishing a Package

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Guide

---

# Purpose

Dokumen ini menjelaskan prosedur standar untuk mempublikasikan reusable package.

Panduan ini memastikan package yang dipublikasikan memenuhi standar kualitas repository, menjaga compatibility, dan menyediakan public API yang stabil.

---

# Prerequisites

Sebelum melakukan publish, pahami dokumen berikut.

- Source-first Development
- Shared Packages
- Dependency Management
- Package Exports
- Build, Deploy, and Publish

---

# When to Publish

Publish dilakukan ketika.

- package akan digunakan di luar repository
- terdapat perubahan yang perlu didistribusikan
- public API telah siap digunakan consumer

Package internal yang hanya digunakan di dalam repository tidak perlu dipublish.

---

# Procedure

## Step 1 — Review the Package

Pastikan package.

- memiliki satu tanggung jawab
- memiliki public API yang jelas
- tidak mengekspos implementasi internal

Review kembali boundary package sebelum melakukan distribusi.

---

## Step 2 — Evaluate Changes

Identifikasi perubahan sejak versi sebelumnya.

Perhatikan.

- penambahan fitur
- perbaikan bug
- perubahan perilaku
- perubahan public API

Evaluasi apakah perubahan tersebut memengaruhi compatibility.

---

## Step 3 — Review Versioning

Pastikan versi berikutnya sesuai dengan jenis perubahan.

Sebagai panduan umum.

- Patch untuk perbaikan yang kompatibel.
- Minor untuk penambahan fitur yang tetap kompatibel.
- Major untuk breaking change.

Versioning harus mencerminkan dampak perubahan terhadap consumer.

---

## Step 4 — Validate Public API

Periksa bahwa.

- seluruh export yang didukung masih tersedia
- tidak ada export internal yang terbuka
- dokumentasi sesuai dengan public API

Public API merupakan kontrak package.

---

## Step 5 — Verify Dependencies

Pastikan.

- dependency tidak berlebihan
- dependency mengikuti dependency policy repository
- tidak terdapat circular dependency

Hapus dependency yang tidak lagi digunakan.

---

## Step 6 — Run Repository Validation

Pastikan package berhasil melewati seluruh workflow repository.

Minimal.

```text
typecheck

lint

test

build
```

Package yang gagal validasi tidak boleh dipublish.

---

## Step 7 — Build the Distribution Artifact

Lakukan build untuk menghasilkan artifact distribusi.

Source tetap menjadi source of truth.

Artifact hanya digunakan untuk distribusi.

---

## Step 8 — Publish

Distribusikan artifact menggunakan mekanisme publishing yang berlaku untuk repository.

Publish dilakukan setelah seluruh proses validasi selesai.

---

## Step 9 — Verify the Published Package

Setelah publish.

Pastikan.

- package dapat diinstal
- public API dapat digunakan
- versi sesuai
- artifact sesuai hasil build

---

# Validation Checklist

Sebelum publish.

- [ ] Public API telah direview.
- [ ] Tidak ada internal module yang diekspos.
- [ ] Version telah diperbarui.
- [ ] Dependency telah diverifikasi.
- [ ] Typecheck berhasil.
- [ ] Lint berhasil.
- [ ] Test berhasil.
- [ ] Build berhasil.
- [ ] Dokumentasi telah diperbarui bila diperlukan.

---

# Common Mistakes

## Publishing Internal Packages

Jangan mempublikasikan package yang memang hanya ditujukan untuk penggunaan internal repository.

---

## Publishing Breaking Changes Without Version Review

Perubahan pada public API harus disertai evaluasi compatibility dan versioning yang sesuai.

---

## Exposing Internal Modules

Jangan menambahkan export hanya karena mempermudah implementasi sesaat.

Setiap export menjadi bagian dari kontrak jangka panjang.

---

## Publishing Without Validation

Jangan melewati proses typecheck, lint, test, atau build.

---

# Troubleshooting

## Consumer Tidak Menemukan Export

Periksa kembali konfigurasi public API dan pastikan export yang dimaksud memang merupakan bagian dari kontrak package.

---

## Version Tidak Sesuai

Pastikan versi telah diperbarui sebelum proses publish dimulai.

---

## Build Artifact Tidak Valid

Pastikan build dilakukan dari source terbaru dan seluruh validasi repository telah berhasil.

