# Build, Deploy, and Publish

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan peran proses **build**, **deploy**, dan **publish** dalam lifecycle software repository.

Ketiga proses tersebut memiliki tujuan yang berbeda dan tidak boleh diperlakukan sebagai aktivitas yang sama.

Repository membedakan ketiganya secara eksplisit agar workflow development tetap sederhana dan proses distribusi tetap dapat diprediksi.

---

# Scope

Dokumen ini berlaku untuk seluruh project dalam repository.

Mencakup:

- application
- shared package
- development workflow
- distribution workflow

Dokumen ini tidak menjelaskan cara menjalankan tool build tertentu.

---

# Background

Pada banyak project, istilah build, deploy, dan publish sering digunakan secara bergantian.

Akibatnya.

- build dilakukan lebih sering daripada yang diperlukan
- publish disamakan dengan deploy
- workflow development menjadi kompleks
- tanggung jawab tooling menjadi kabur

Repository memisahkan ketiga proses tersebut berdasarkan tujuan masing-masing.

---

# Definitions

## Build

Proses mengubah source menjadi artifact.

Artifact dapat berupa.

- JavaScript
- bundle
- declaration file
- static asset

Build tidak mendistribusikan software.

---

## Deploy

Proses mengirim artifact ke environment tempat software dijalankan.

Contoh.

- production
- staging
- preview

Deploy tidak menghasilkan artifact baru.

---

## Publish

Proses mendistribusikan package agar dapat digunakan oleh repository lain.

Publish menghasilkan versi yang dapat dikonsumsi sebagai dependency.

Publish bukan deployment.

---

# Software Lifecycle

Repository menggunakan lifecycle berikut.

```text
Source

↓

Build

↓

Artifact

├── Deploy Application

└── Publish Package
```

Build selalu menghasilkan artifact.

Artifact kemudian digunakan untuk deployment atau publishing.

---

# Development Workflow

Selama development.

Repository menggunakan pendekatan Source-first Development.

```text
Source

↓

Application
```

Development tidak bergantung pada build artifact.

---

# Distribution Workflow

Ketika software akan didistribusikan.

```text
Source

↓

Build

↓

Artifact

↓

Distribution
```

Distribution dapat berupa deployment ataupun package publishing.

---

# Application Lifecycle

Application memiliki lifecycle berikut.

```text
Source

↓

Build

↓

Deploy
```

Application tidak dipublish sebagai reusable package.

Application merupakan deployment unit.

---

# Package Lifecycle

Reusable package memiliki lifecycle berikut.

```text
Source

↓

Build

↓

Publish
```

Package tidak dideploy sebagai aplikasi.

Package merupakan distribution unit.

---

# Internal Packages

Repository membedakan internal package dan distributable package.

Internal package.

- digunakan di dalam repository
- mengikuti Source-first Development
- tidak memerlukan build selama development

Build dilakukan ketika memang dibutuhkan oleh proses distribusi atau tooling tertentu.

---

# Build Ownership

Build bukan tanggung jawab package.

Build merupakan bagian dari distribution pipeline.

Package hanya menyediakan source.

Pipeline menghasilkan artifact.

---

# Design Decisions

## Source-first Development

Development menggunakan source secara langsung.

---

## Distribution Requires Build

Distribusi selalu menggunakan artifact.

---

## Applications Are Deployed

Application menghasilkan deployment.

---

## Libraries Are Published

Reusable library menghasilkan package yang dapat digunakan consumer.

---

# Standards

## Rule 1

Development tidak boleh bergantung pada artifact.

---

## Rule 2

Deploy selalu menggunakan artifact hasil build.

---

## Rule 3

Publish selalu menggunakan artifact hasil build.

---

## Rule 4

Application tidak dipublish sebagai package.

---

## Rule 5

Reusable package tidak diperlakukan sebagai deployment unit.

---

# Trade-offs

Keuntungan.

- workflow development lebih sederhana
- distribusi lebih jelas
- build memiliki tujuan yang spesifik
- tanggung jawab pipeline menjadi jelas

Konsekuensi.

- development dan distribution memiliki workflow yang berbeda
- pipeline distribusi harus mampu menghasilkan artifact yang konsisten

---

# Best Practices

- Pisahkan development dari distribution.
- Bangun artifact hanya ketika diperlukan.
- Perlakukan build sebagai proses reproduksi source.
- Gunakan artifact yang sama untuk deploy maupun publish.

---

# Anti-patterns

- Build sebelum setiap perubahan kecil.
- Mengedit build artifact secara langsung.
- Menyamakan publish dengan deploy.
- Menggunakan artifact sebagai source of truth.

---

# Review Checklist

- [ ] Development tetap menggunakan source.
- [ ] Build hanya menghasilkan artifact.
- [ ] Deploy menggunakan artifact.
- [ ] Publish menggunakan artifact.
- [ ] Workflow development dan distribution tetap terpisah.

---

# FAQ

## Mengapa build tidak selalu dijalankan saat development?

Karena repository menggunakan pendekatan Source-first Development. Build dilakukan ketika diperlukan untuk menghasilkan artifact distribusi.

---

## Apakah semua package harus dibuild?

Tidak.

Package internal dapat digunakan langsung dari source selama workflow dan tooling mendukungnya.

---

## Apakah deploy sama dengan publish?

Tidak.

Deploy mengirim application ke environment runtime.

Publish mendistribusikan package agar dapat digunakan sebagai dependency oleh consumer.

