# Frequently Asked Questions (FAQ)

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Reference

---

# Purpose

Dokumen ini mengumpulkan pertanyaan yang paling sering muncul saat bekerja dengan repository.

Jawaban pada dokumen ini bersifat ringkas. Untuk penjelasan lengkap, ikuti tautan ke dokumen terkait.

---

# General

## Mengapa repository menggunakan monorepo?

Monorepo memudahkan pengelolaan shared package, konsistensi tooling, dan koordinasi antar project.

See:

- Workspace
- Shared Packages

---

## Mengapa repository menggunakan Source-first Development?

Agar development dapat dilakukan langsung dari source tanpa bergantung pada build artifact.

See:

- Source-first Development

---

## Mengapa repository memiliki banyak package kecil?

Setiap package memiliki satu tanggung jawab sehingga lebih mudah digunakan kembali, diuji, dan dipelihara.

See:

- Engineering Principles
- Shared Packages

---

# Packages

## Kapan saya harus membuat package baru?

Buat package hanya jika terdapat domain yang reusable dan memiliki lifecycle yang independen.

See:

- Create a Package

---

## Kapan saya tidak perlu membuat package?

Jika kode hanya digunakan oleh satu application atau satu domain, tetap letakkan di application tersebut.

See:

- Create a Package

---

## Bolehkah package mengakses module internal package lain?

Tidak.

Gunakan hanya public API.

See:

- Package Exports

---

## Mengapa tidak boleh import dari `src/` package lain?

Karena struktur internal bukan bagian dari kontrak package dan dapat berubah kapan saja.

See:

- Package Exports

---

# Dependencies

## Mengapa dependency hanya boleh satu arah?

Agar repository tetap memiliki dependency graph yang sederhana dan bebas circular dependency.

See:

- Layered Architecture
- Dependency Management

---

## Mengapa UI boleh menggunakan Utils tetapi bukan sebaliknya?

Karena dependency selalu mengarah ke layer yang lebih rendah.

See:

- Dependency Matrix

---

## Apa yang harus dilakukan jika muncul circular dependency?

Pisahkan responsibility package atau ubah dependency agar kembali mengikuti dependency matrix.

See:

- Dependency Management
- Repository Troubleshooting

---

# Applications

## Apa perbedaan application dan package?

Application adalah deployment unit.

Package adalah reusable unit.

See:

- Build, Deploy, and Publish
- Shared Packages

---

## Mengapa application tidak dipublish?

Karena application didistribusikan melalui deployment, bukan sebagai dependency.

See:

- Build, Deploy, and Publish

---

# Build and Distribution

## Kapan build dilakukan?

Saat artifact diperlukan untuk distribusi atau deployment.

See:

- Build, Deploy, and Publish

---

## Apakah development selalu membutuhkan build?

Tidak.

Repository menggunakan Source-first Development.

See:

- Source-first Development

---

## Apa perbedaan build, deploy, dan publish?

- Build menghasilkan artifact.
- Deploy mengirim artifact ke runtime.
- Publish mendistribusikan package.

See:

- Build, Deploy, and Publish
- Glossary

---

# Tooling

## Apakah Turborepo adalah build tool?

Tidak.

Turborepo hanya mengorkestrasi task.

See:

- Turborepo

---

## Mengapa repository menggunakan shared TypeScript configuration?

Agar seluruh project menggunakan konfigurasi compiler yang konsisten.

See:

- TypeScript Configuration

---

## Mengapa environment configuration dipusatkan?

Agar validasi runtime dan konfigurasi tetap konsisten di seluruh repository.

See:

- Environment Configuration

---

# Workflow

## Apa yang harus dilakukan sebelum membuka pull request?

Pastikan.

- typecheck berhasil
- lint berhasil
- test berhasil
- build berhasil (bila diperlukan)
- perubahan mengikuti handbook

See:

- Repository Troubleshooting
- Publishing a Package

---

## Di mana saya harus mencari solusi jika terjadi error?

1. Baca troubleshooting pada guide yang relevan.
2. Gunakan Repository Troubleshooting.
3. Periksa dokumen Architecture terkait.

---

# Documentation

## Dokumen mana yang harus saya baca terlebih dahulu?

Urutan yang disarankan.

1. README
2. Concepts
3. Architecture
4. Guides
5. Reference

---

## Saya hanya ingin mengetahui aturan tertentu.

Gunakan bagian Reference sebagai dokumentasi lookup.

---

## Saya ingin memahami alasan di balik suatu aturan.

Lihat bagian Concepts atau Architecture.

