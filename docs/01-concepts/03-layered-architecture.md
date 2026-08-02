# Layered Architecture

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Concept

---

# Purpose

Dokumen ini mendefinisikan konsep **Layered Architecture** yang menjadi dasar organisasi dependency pada repository.

Layered Architecture digunakan untuk mengurangi coupling, meningkatkan maintainability, dan memastikan dependency selalu mengarah ke komponen yang lebih stabil.

Dokumen ini menjelaskan konsep secara umum.

Implementasi spesifik repository dijelaskan pada dokumen Architecture.

---

# Scope

Dokumen ini berlaku untuk seluruh software yang dibangun di dalam repository.

Mencakup:

- module
- package
- library
- application
- dependency direction

Dokumen ini tidak membahas struktur folder maupun tooling.

---

# Definitions

## Layer

Sekelompok komponen yang memiliki tingkat tanggung jawab dan stabilitas yang sama.

Layer menjadi batas logis dalam arsitektur.

---

## Dependency

Hubungan ketika satu komponen membutuhkan komponen lain untuk bekerja.

---

## Upstream

Layer yang lebih stabil.

Perubahan pada layer ini relatif jarang.

---

## Downstream

Layer yang lebih dekat dengan aplikasi.

Perubahan terjadi lebih sering.

---

## Dependency Direction

Arah dependency antar layer.

Layered Architecture mengharuskan dependency mengarah menuju layer yang lebih stabil.

---

# Background

Semakin besar sebuah codebase, semakin sulit mengendalikan dependency.

Tanpa aturan yang jelas, dependency dapat terbentuk secara acak.

Akibatnya:

- circular dependency
- hidden dependency
- tight coupling
- sulit melakukan refactoring
- perubahan kecil memengaruhi banyak area

Layered Architecture diperkenalkan untuk mengendalikan pertumbuhan dependency tersebut.

---

# Principle

Software dibagi menjadi beberapa layer.

Setiap layer memiliki tanggung jawab yang jelas.

Dependency hanya boleh mengarah ke layer yang lebih stabil.

Layer tidak boleh bergantung pada layer yang berada di atasnya.

---

# Objectives

Layered Architecture bertujuan untuk:

- membatasi coupling
- meningkatkan cohesion
- mempermudah maintenance
- mempermudah testing
- mempermudah refactoring
- menjaga stabilitas sistem

---

# Characteristics

Layer yang baik memiliki karakteristik berikut.

## Clear Responsibility

Setiap layer memiliki satu tujuan utama.

---

## Stable Boundary

Boundary antar layer jelas dan tidak berubah-ubah.

---

## Directed Dependencies

Dependency hanya mengalir ke satu arah.

---

## Independent Evolution

Perubahan pada layer atas tidak memaksa layer bawah ikut berubah.

---

# Dependency Direction

Dependency harus selalu bergerak menuju layer yang lebih stabil.

```text
Less Stable

↓

Business Logic

↓

Shared Logic

↓

Foundation

More Stable
```

Layer paling bawah tidak mengetahui keberadaan layer di atasnya.

Sebaliknya, layer atas dapat menggunakan layanan yang disediakan layer bawah.

---

# Stability Principle

Semakin banyak komponen yang bergantung pada suatu layer, semakin stabil layer tersebut harus dijaga.

Layer yang memiliki banyak consumer tidak boleh sering mengalami breaking change.

Stabilitas meningkat seiring bertambahnya jumlah dependents.

---

# Layer Independence

Layer tidak boleh mengetahui implementasi internal layer lain.

Interaksi hanya dilakukan melalui public interface.

Dengan demikian, perubahan implementasi tidak memengaruhi consumer selama kontrak tetap sama.

---

# Benefits

Layered Architecture memberikan beberapa keuntungan.

## Predictable Dependencies

Arah dependency mudah dipahami.

---

## Easier Refactoring

Perubahan dapat dilakukan tanpa memengaruhi seluruh sistem.

---

## Better Reusability

Layer bawah dapat digunakan oleh banyak consumer.

---

## Better Testing

Setiap layer dapat diuji secara independen.

---

## Better Scalability

Repository dapat berkembang tanpa menghasilkan dependency graph yang sulit dikendalikan.

---

# Trade-offs

Layered Architecture juga memiliki konsekuensi.

## Additional Design

Boundary harus dirancang dengan baik.

---

## Architectural Discipline

Developer harus mematuhi aturan dependency.

---

## Initial Complexity

Pada project kecil, pembagian layer mungkin terlihat berlebihan.

Namun manfaatnya meningkat seiring bertambahnya ukuran repository.

---

# Common Violations

## Circular Dependency

Layer A bergantung pada Layer B.

Layer B bergantung pada Layer A.

Boundary menjadi hilang.

---

## Dependency Inversion Failure

Layer bawah mengetahui implementasi layer atas.

Hal ini menyebabkan coupling meningkat.

---

## Shared Dumping Ground

Satu layer digunakan sebagai tempat semua kode bersama tanpa domain yang jelas.

Layer kehilangan identitasnya.

---

# Design Constraints

Repository yang menerapkan Layered Architecture harus memenuhi syarat berikut.

- dependency memiliki arah yang jelas
- tidak ada circular dependency
- setiap layer memiliki tanggung jawab tunggal
- boundary terdokumentasi
- public interface menjadi satu-satunya jalur komunikasi

---

# Best Practices

- Definisikan tanggung jawab setiap layer.
- Pertahankan dependency satu arah.
- Gunakan public API sebagai boundary.
- Hindari akses langsung ke implementasi internal.
- Review dependency graph secara berkala.

---

# Anti-patterns

- Circular dependency.
- Layer yang memiliki lebih dari satu domain.
- Mengakses internal module milik layer lain.
- Menambahkan dependency demi kemudahan sementara.
- Menjadikan satu layer sebagai tempat "shared" tanpa tujuan.

---

# Review Checklist

Saat mengevaluasi perubahan arsitektur.

- [ ] Dependency tetap satu arah.
- [ ] Tidak muncul circular dependency.
- [ ] Layer tetap memiliki satu tanggung jawab.
- [ ] Public interface tetap menjadi boundary.
- [ ] Coupling tidak meningkat tanpa alasan.

---

# FAQ

## Apakah jumlah layer harus selalu sama?

Tidak.

Jumlah layer bergantung pada kebutuhan sistem.

Yang penting adalah arah dependency dan tanggung jawab setiap layer tetap jelas.

---

## Apakah Layered Architecture sama dengan folder structure?

Tidak.

Layer adalah konsep arsitektur.

Folder hanya salah satu cara merepresentasikan konsep tersebut.

---

## Apakah Layered Architecture mengharuskan framework tertentu?

Tidak.

Konsep ini independen terhadap bahasa pemrograman maupun framework.

