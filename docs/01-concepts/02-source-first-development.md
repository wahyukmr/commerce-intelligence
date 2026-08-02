# Source-first Development

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Concept

---

# Purpose

Dokumen ini mendefinisikan konsep **Source-first Development** yang menjadi filosofi utama workflow development repository.

Source-first Development menjelaskan bagaimana source code diperlakukan selama proses pengembangan, serta mengapa repository memilih menggunakan source secara langsung dibandingkan build artifact.

Dokumen ini hanya membahas konsep.

Implementasi teknis dijelaskan pada dokumen Architecture.

---

# Scope

Dokumen ini berlaku untuk seluruh proses development pada repository.

Mencakup:

- applications
- shared packages
- tooling workflow
- local development

Dokumen ini tidak membahas konfigurasi Vite, pnpm, Turbo, maupun TypeScript.

---

# Definitions

## Source Code

Kode yang ditulis dan dipelihara oleh developer.

Source merupakan representasi utama dari sistem.

---

## Build Artifact

Output yang dihasilkan dari proses build.

Contoh:

- JavaScript hasil transpile
- bundle aplikasi
- declaration file
- static assets

Artifact merupakan turunan dari source.

---

## Source-first Development

Pendekatan development di mana source code menjadi input utama seluruh workflow development.

Selama development, aplikasi menggunakan source secara langsung tanpa bergantung pada artifact hasil build.

---

# Background

Workflow tradisional biasanya mengikuti pola berikut.

```text
Source

↓

Build

↓

Artifact

↓

Development
```

Setiap perubahan source memerlukan proses build sebelum perubahan dapat digunakan.

Pendekatan tersebut masih sesuai untuk distribusi software, tetapi tidak selalu optimal untuk pengembangan dalam satu repository.

Source-first Development menghilangkan ketergantungan tersebut.

---

# Principle

Repository menganggap source sebagai representasi utama sistem.

Build artifact hanya merupakan hasil transformasi yang dapat dibuat ulang kapan saja.

Konsekuensinya:

- source diprioritaskan
- artifact dianggap disposable
- development tidak bergantung pada artifact

---

# Objectives

Source-first Development memiliki beberapa tujuan.

## Fast Feedback

Perubahan source harus dapat digunakan secepat mungkin.

Developer tidak seharusnya menunggu proses build hanya untuk memverifikasi perubahan kecil.

---

## Single Source of Truth

Source merupakan satu-satunya representasi resmi dari sistem.

Artifact tidak boleh menjadi lokasi perubahan.

---

## Reduced Operational Complexity

Semakin sedikit langkah yang diperlukan untuk menjalankan development, semakin kecil peluang terjadinya inkonsistensi.

---

## Better Developer Experience

Workflow yang sederhana meningkatkan produktivitas dan mengurangi waktu tunggu.

---

# Development Model

Repository memisahkan development dan distribution.

Development.

```text
Source

↓

Application
```

Distribution.

```text
Source

↓

Build

↓

Artifact
```

Build hanya diperlukan ketika artifact akan digunakan di luar proses development.

---

# Build is a Distribution Concern

Repository memandang build sebagai proses distribusi.

Build tidak menentukan bagaimana developer menulis kode.

Build menentukan bagaimana software dikirim kepada consumer.

Dengan demikian:

- development berfokus pada source
- distribution berfokus pada artifact

---

# Source as the Primary Asset

Source memiliki karakteristik berikut.

- dapat dibaca
- dapat diubah
- dapat direview
- dapat diuji
- dapat dihasilkan kembali menjadi artifact

Artifact tidak memiliki karakteristik tersebut.

Oleh karena itu source menjadi aset utama repository.

---

# Disposable Artifacts

Artifact harus dapat dihasilkan kembali kapan saja.

Repository tidak menganggap artifact sebagai bagian permanen dari source repository.

Jika artifact dapat direproduksi dari source, maka artifact tidak menjadi sumber kebenaran.

---

# Benefits

Pendekatan Source-first Development memberikan beberapa keuntungan.

## Faster Development

Mengurangi langkah yang tidak memberikan nilai langsung kepada developer.

---

## Simpler Repository

Repository tidak dipenuhi hasil build yang dapat dibuat ulang.

---

## Easier Refactoring

Perubahan implementasi cukup dilakukan pada source.

Artifact akan mengikuti perubahan tersebut.

---

## Better Consistency

Seluruh developer bekerja terhadap source yang sama.

---

# Trade-offs

Source-first Development juga memiliki konsekuensi.

## Tooling Requirements

Workflow membutuhkan tooling yang mampu bekerja langsung dengan source.

---

## Clear Separation

Repository harus mampu membedakan workflow development dan workflow distribution.

---

## Build Remains Necessary

Source-first Development tidak menghilangkan kebutuhan build.

Build tetap diperlukan ketika software akan didistribusikan.

---

# Relationship with Other Principles

Source-first Development merupakan implementasi dari beberapa prinsip engineering.

```text
Engineering Principles

↓

Source of Truth

↓

Source-first Development
```

Prinsip lain yang mendukung pendekatan ini.

- DRY
- KISS
- Fail Fast
- Separation of Concerns

---

# Design Constraints

Repository yang menggunakan Source-first Development harus memenuhi syarat berikut.

- source selalu tersedia
- artifact selalu dapat direproduksi
- development tidak bergantung pada artifact
- workflow distribution dipisahkan dari workflow development

---

# Best Practices

- Perlakukan source sebagai aset utama repository.
- Hindari ketergantungan development terhadap build artifact.
- Pisahkan proses development dan distribution.
- Pastikan artifact selalu dapat direproduksi dari source.

---

# Anti-patterns

## Editing Build Artifact

Perubahan pada artifact akan hilang ketika build berikutnya dijalankan.

Perubahan hanya boleh dilakukan pada source.

---

## Using Artifact as Source of Truth

Artifact merupakan hasil transformasi.

Artifact bukan representasi utama sistem.

---

## Mixing Development and Distribution

Workflow development dan workflow distribusi memiliki tujuan yang berbeda.

Mencampurkan keduanya meningkatkan kompleksitas.

---

# Review Checklist

Saat mengevaluasi workflow development.

- [ ] Source tetap menjadi aset utama.
- [ ] Artifact dapat dihasilkan kembali.
- [ ] Development tidak bergantung pada artifact.
- [ ] Workflow distribution tetap terpisah.
- [ ] Tidak ada perubahan langsung pada artifact.

---

# FAQ

## Apakah Source-first Development berarti build tidak diperlukan?

Tidak.

Build tetap diperlukan untuk menghasilkan artifact yang akan didistribusikan.

---

## Apakah semua repository cocok menggunakan pendekatan ini?

Tidak selalu.

Pendekatan ini paling sesuai untuk repository yang mengembangkan source dan consumer dalam ekosistem yang sama, seperti monorepo.

---

## Apakah artifact boleh disimpan?

Boleh.

Namun artifact tidak boleh diperlakukan sebagai source of truth.


