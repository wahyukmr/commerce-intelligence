# Engineering Principles

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Concept

---

# Purpose

Dokumen ini mendefinisikan prinsip-prinsip software engineering yang menjadi fondasi seluruh keputusan arsitektur repository.

Prinsip-prinsip pada dokumen ini bersifat independen terhadap tooling. Pergantian framework, package manager, bundler, atau build system tidak mengubah validitas prinsip-prinsip tersebut.

Seluruh keputusan arsitektur yang dijelaskan pada handbook ini harus dapat ditelusuri kembali ke salah satu prinsip dalam dokumen ini.

---

# Scope

Dokumen ini berlaku untuk seluruh repository.

Mencakup:

- aplikasi
- shared packages
- tooling
- konfigurasi
- dokumentasi
- code review

Dokumen ini tidak membahas implementasi teknis atau konfigurasi tool tertentu.

---

# Definitions

## Principle

Aturan dasar yang menjadi pedoman dalam mengambil keputusan engineering.

Principle menjelaskan **mengapa** sesuatu dilakukan.

---

## Standard

Aturan implementasi yang wajib diikuti.

Standard menjelaskan **apa** yang harus dilakukan.

---

## Guide

Dokumen operasional yang menjelaskan **bagaimana** melakukan suatu pekerjaan.

---

## Architecture

Keputusan desain yang dipilih repository berdasarkan prinsip engineering.

---

# Engineering Philosophy

Repository dibangun berdasarkan keyakinan berikut.

1. Arsitektur lebih penting daripada tooling.
2. Struktur lebih penting daripada optimisasi prematur.
3. Konsistensi lebih penting daripada preferensi individu.
4. Repository harus mudah dipahami sebelum mudah diperluas.
5. Setiap keputusan harus memiliki alasan yang dapat dijelaskan.

Prinsip-prinsip berikut merupakan implementasi dari filosofi tersebut.

---

# Principle 1 — Separation of Concerns

## Definition

Setiap bagian sistem harus memiliki tanggung jawab yang berbeda.

Repository dipisahkan berdasarkan domain pekerjaan, bukan berdasarkan ukuran kode.

Contoh.

```text
apps/
packages/ui
packages/utils
packages/types
```

Masing-masing memiliki tujuan yang berbeda.

---

## Intent

Memisahkan tanggung jawab membuat sistem lebih mudah dipahami, diuji, dan dikembangkan.

Perubahan pada satu domain tidak boleh memengaruhi domain lain tanpa alasan yang jelas.

---

## Consequences

Keuntungan.

- struktur lebih jelas
- ownership lebih mudah
- testing lebih sederhana
- maintenance lebih murah

Risiko jika diabaikan.

- folder menjadi "tempat segala sesuatu"
- dependency sulit dikendalikan
- perubahan kecil berdampak luas

---

# Principle 2 — Single Responsibility Principle

## Definition

Sebuah module hanya memiliki satu alasan untuk berubah.

Tanggung jawab package harus dapat dijelaskan dalam satu kalimat.

Contoh.

```
@my/ui
```

> Menyediakan reusable React components.

Contoh.

```
@my/types
```

> Menyediakan shared type definitions.

Jika sebuah package membutuhkan beberapa kalimat untuk menjelaskan fungsinya, kemungkinan tanggung jawabnya terlalu luas.

---

# Principle 3 — Source of Truth

## Definition

Setiap informasi hanya memiliki satu lokasi yang dianggap benar.

Repository menerapkan prinsip ini pada berbagai domain.

Contoh.

| Domain | Source of Truth |
|---------|-----------------|
| TypeScript Configuration | config-typescript |
| Environment Validation | config-env |
| Shared Types | types |
| Shared Components | ui |

Duplikasi source of truth akan menghasilkan inkonsistensi.

---

# Principle 4 — Don't Repeat Yourself

## Definition

Logika, konfigurasi, maupun pengetahuan tidak boleh diduplikasi tanpa alasan yang jelas.

DRY bukan berarti setiap baris yang mirip harus digabungkan.

DRY berarti setiap informasi memiliki satu representasi utama.

---

## Intent

Mengurangi biaya perubahan.

Jika satu perubahan membutuhkan modifikasi pada banyak lokasi, kemungkinan terdapat pelanggaran terhadap prinsip ini.

---

# Principle 5 — High Cohesion

## Definition

Seluruh isi package harus saling berhubungan.

Semakin tinggi cohesion, semakin jelas identitas package tersebut.

Package yang baik dapat dijelaskan dalam satu domain.

Package yang buruk menjadi kumpulan kode yang tidak berkaitan.

---

# Principle 6 — Low Coupling

## Definition

Dependency antar package harus seminimal mungkin.

Setiap package hanya mengetahui apa yang memang perlu diketahui.

Coupling yang rendah meningkatkan fleksibilitas sistem.

---

## Intent

Repository harus memungkinkan refactoring tanpa menghasilkan perubahan besar pada consumer.

---

# Principle 7 — Stable Dependency Principle

## Definition

Dependency harus mengarah menuju komponen yang lebih stabil.

Repository menerapkan dependency satu arah.

```text
Applications

▲

UI

▲

Utilities

▲

Types
```

Package pada layer bawah berubah lebih jarang dibanding package pada layer atas.

---

# Principle 8 — Package as Boundary

## Definition

Package merupakan unit arsitektur utama.

Boundary package memisahkan.

- ownership
- dependency
- public API
- lifecycle

Repository tidak menggunakan folder sebagai boundary arsitektur.

---

# Principle 9 — Public API First

## Definition

Consumer hanya bergantung pada public API.

Implementasi internal merupakan detail.

Perubahan implementasi tidak boleh memaksa consumer ikut berubah selama public API tetap sama.

---

# Principle 10 — Convention over Configuration

## Definition

Repository lebih mengutamakan konvensi yang konsisten daripada konfigurasi yang berbeda-beda.

Konvensi mengurangi kebutuhan dokumentasi tambahan dan mempercepat proses onboarding.

---

# Principle 11 — Keep It Simple

## Definition

Pilih solusi paling sederhana yang memenuhi kebutuhan saat ini.

Kompleksitas hanya ditambahkan ketika terdapat kebutuhan yang dapat dibuktikan.

---

# Principle 12 — You Aren't Gonna Need It

## Definition

Repository tidak membangun abstraksi berdasarkan kemungkinan kebutuhan di masa depan.

Fitur ditambahkan ketika benar-benar memiliki consumer yang jelas.

---

# Principle 13 — Fail Fast

## Definition

Kesalahan harus ditemukan sedekat mungkin dengan sumbernya.

Semakin awal kesalahan ditemukan, semakin rendah biaya perbaikannya.

Contoh implementasi prinsip ini meliputi validasi konfigurasi saat startup, type checking saat development, dan pengujian otomatis sebelum merge.

---

# Relationship Between Principles

Prinsip-prinsip ini saling mendukung.

```text
Engineering Principles

├── Separation of Concerns
│
├── Single Responsibility
│
├── Source of Truth
│
├── DRY
│
├── High Cohesion
│
├── Low Coupling
│
├── Stable Dependency
│
├── Package Boundary
│
├── Public API
│
├── Convention
│
├── KISS
│
├── YAGNI
│
└── Fail Fast
```

Tidak ada satu prinsip yang berdiri sendiri.

Keputusan engineering biasanya merupakan hasil kompromi antara beberapa prinsip sekaligus.

---

# Decision Framework

Setiap keputusan engineering sebaiknya dievaluasi menggunakan pertanyaan berikut.

1. Apakah tanggung jawabnya jelas?
2. Apakah menambah coupling?
3. Apakah melanggar boundary?
4. Apakah menciptakan source of truth baru?
5. Apakah solusi ini sesederhana mungkin?
6. Apakah benar-benar dibutuhkan saat ini?
7. Apakah akan lebih mudah dipelihara enam bulan dari sekarang?

Jika sebagian besar jawaban adalah "tidak", keputusan tersebut perlu ditinjau ulang.

---

# Best Practices

- Jadikan prinsip sebagai dasar sebelum memilih tool.
- Utamakan konsistensi dibanding preferensi individu.
- Dokumentasikan keputusan besar melalui ADR.
- Hindari abstraksi tanpa kebutuhan yang jelas.
- Perlakukan package sebagai unit arsitektur.

---

# Anti-patterns

- Menggunakan tool baru tanpa masalah yang ingin diselesaikan.
- Membuat package tanpa domain yang jelas.
- Menambah abstraksi karena "mungkin nanti berguna".
- Mengabaikan boundary demi solusi cepat.
- Mengorbankan konsistensi untuk preferensi pribadi.

---

# Review Checklist

Sebelum menerima perubahan arsitektur.

- [ ] Perubahan mengikuti prinsip repository.
- [ ] Tidak menambah coupling yang tidak perlu.
- [ ] Tidak menciptakan source of truth baru.
- [ ] Boundary package tetap terjaga.
- [ ] Tanggung jawab setiap package tetap jelas.

---

# FAQ

## Apakah prinsip ini wajib diikuti?

Ya. Dokumen architecture, guides, dan code review mengacu pada prinsip-prinsip ini.

## Apakah prinsip boleh dilanggar?

Boleh, tetapi harus memiliki alasan teknis yang jelas dan, untuk perubahan arsitektur yang signifikan, didokumentasikan melalui Architecture Decision Record (ADR).

## Mengapa dokumen ini tidak membahas pnpm, Turbo, atau Vite?

Karena tooling dapat berubah. Prinsip engineering tetap relevan meskipun tooling diganti.


