# Turborepo

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Architecture

---

# Purpose

Dokumen ini mendefinisikan peran Turborepo dalam arsitektur repository.

Repository menggunakan Turborepo sebagai **task orchestrator** untuk menjalankan workflow development secara konsisten di seluruh workspace.

Turborepo tidak membangun aplikasi, tidak melakukan bundling, dan tidak menggantikan tooling yang sudah ada.

---

# Scope

Dokumen ini berlaku untuk seluruh workspace.

Mencakup:

- task orchestration
- pipeline execution
- task dependency
- workspace execution

Dokumen ini tidak membahas:

- build tool
- bundler
- compiler
- package manager
- dependency management

---

# Background

Repository terdiri dari banyak project.

Setiap project memiliki task sendiri.

Contoh.

- development server
- type checking
- linting
- testing
- build

Menjalankan seluruh task tersebut secara manual menjadi sulit ketika jumlah project bertambah.

Repository menggunakan Turborepo untuk mengorkestrasi task-task tersebut sebagai satu workflow.

---

# Architecture Overview

Repository membedakan dua hal.

## Tool

Software yang mengerjakan suatu pekerjaan.

Contoh.

- Vite
- TypeScript
- Biome
- Vitest

---

## Orchestrator

Software yang menentukan.

- kapan task dijalankan
- urutan task
- dependency antar task
- task mana yang perlu dijalankan

Repository menggunakan Turborepo sebagai orchestrator.

---

# Responsibilities

Turborepo bertanggung jawab terhadap.

- menjalankan task
- mengatur dependency antar task
- menghindari eksekusi yang tidak diperlukan
- menyediakan workflow yang konsisten

Turborepo tidak mengetahui bagaimana sebuah task diimplementasikan.

---

# Task Model

Repository memperlakukan seluruh aktivitas sebagai task.

Contoh.

```text
dev

build

test

lint

typecheck
```

Task didefinisikan oleh project.

Turborepo hanya mengorkestrasi eksekusinya.

---

# Task Ownership

Setiap task dimiliki oleh project yang bersangkutan.

Sebagai contoh.

Application dapat memiliki task.

```text
dev
```

Library dapat memiliki task.

```text
build
```

Tooling dapat memiliki task.

```text
typecheck
```

Turborepo tidak menggantikan implementasi task tersebut.

---

# Pipeline

Pipeline merupakan hubungan antar task.

Secara konseptual.

```text
typecheck

↓

build

↓

test
```

Pipeline menentukan urutan eksekusi.

Pipeline bukan implementasi task.

---

# Workspace Execution

Turborepo menjalankan task pada seluruh workspace.

Secara konseptual.

```text
Workspace

├── App A
├── App B
├── Package A
└── Package B
```

Ketika suatu task dijalankan, Turborepo menentukan project mana yang perlu berpartisipasi berdasarkan pipeline dan dependency graph.

---

# Incremental Execution

Repository menghindari pekerjaan yang tidak diperlukan.

Jika suatu project tidak terpengaruh oleh perubahan, task pada project tersebut tidak perlu dijalankan kembali.

Pendekatan ini meningkatkan efisiensi workflow seiring bertambahnya ukuran repository.

---

# Design Decisions

## Task Orchestration

Repository memisahkan pelaksanaan task dari koordinasi task.

---

## Tool Independence

Tool dapat berubah tanpa mengubah arsitektur workflow.

Selama task tetap tersedia, Turborepo tetap dapat mengorkestrasinya.

---

## Repository-wide Workflow

Workflow didefinisikan pada tingkat repository, bukan pada masing-masing project secara terpisah.

---

# Standards

## Rule 1

Seluruh workflow repository dijalankan melalui Turborepo.

---

## Rule 2

Task tetap diimplementasikan oleh project.

---

## Rule 3

Turborepo tidak menggantikan build tool.

---

## Rule 4

Pipeline harus mencerminkan dependency yang sebenarnya.

---

## Rule 5

Task dengan nama yang sama harus memiliki tujuan yang konsisten di seluruh repository.

---

# Trade-offs

Keuntungan.

- workflow konsisten
- koordinasi task lebih sederhana
- repository lebih mudah dikembangkan
- tooling tetap independen

Konsekuensi.

- pipeline harus dirancang dengan baik
- penamaan task harus konsisten
- perubahan workflow memengaruhi seluruh repository

---

# Best Practices

- Gunakan nama task yang konsisten.
- Biarkan setiap tool mengerjakan tanggung jawabnya sendiri.
- Gunakan Turborepo hanya untuk orkestrasi.
- Pertahankan pipeline tetap sederhana.

---

# Anti-patterns

- Menganggap Turborepo sebagai build tool.
- Memindahkan logika build ke Turborepo.
- Menggunakan nama task yang berbeda untuk tujuan yang sama.
- Membuat pipeline yang tidak mencerminkan dependency sebenarnya.

---

# Review Checklist

- [ ] Task memiliki tanggung jawab yang jelas.
- [ ] Pipeline sesuai dependency.
- [ ] Workflow repository tetap konsisten.
- [ ] Turborepo hanya berperan sebagai orchestrator.
- [ ] Tool tetap bertanggung jawab atas implementasi task.

---

# FAQ

## Apakah Turborepo membangun aplikasi?

Tidak.

Tool seperti Vite atau TypeScript melakukan build.

Turborepo hanya menjalankan task build.

---

## Apakah Turborepo menggantikan pnpm?

Tidak.

pnpm mengelola package dan dependency.

Turborepo mengorkestrasi workflow.

---

## Apakah Turborepo mengetahui isi task?

Tidak.

Task tetap dimiliki oleh masing-masing project.

Turborepo hanya mengetahui cara menjalankannya.

