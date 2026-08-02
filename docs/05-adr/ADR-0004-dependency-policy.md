# ADR-0004: Dependency Policy

> Status: Accepted
>
> Date: 2026-08-02

---

## Context

Repository menggunakan monorepo dengan beberapa package yang memiliki tanggung jawab berbeda. Tanpa aturan dependency yang jelas, package dapat berkembang menjadi saling bergantung dan menyebabkan architectural drift serta refactor besar ketika platform berkembang menjadi SaaS.

---

## Decision

* Internal package menggunakan `workspace:*`.
* Root hanya berisi tooling.
* Runtime tidak memiliki runtime dependency eksternal.
* Commerce hanya bergantung pada runtime dan shared.
* Simulation merupakan adapter dan boleh menggunakan dependency eksternal.
* Dashboard menjadi satu-satunya package yang mengenal framework UI.
* Shared hanya berisi primitive lintas domain.
* Circular dependency dilarang.

---

## Alternatives Considered

### Shared sebagai "common utilities"

**Rejected**

Menyebabkan package menjadi tempat penampungan kode tanpa batas tanggung jawab.

### Runtime menggunakan library utilitas umum

**Rejected**

Mengurangi portabilitas dan meningkatkan risiko vendor lock-in.

### Semua dependency diletakkan di root

**Rejected**

Mengaburkan batas antar-package dan menyulitkan proses publish di masa depan.

---

## Consequences

### Positif

* Runtime tetap ringan dan portabel.
* Batas tanggung jawab package jelas.
* Dashboard dapat berkembang tanpa memengaruhi runtime.
* Simulation dapat bereksperimen tanpa mengotori domain inti.

### Negatif

* Beberapa utilitas perlu diimplementasikan sendiri.
* Menambah disiplin saat menambahkan dependency baru.

---

## Implementation Notes

* Semua import antar-package menggunakan public API (`src/index.ts`).
* Dependency internal menggunakan `workspace:*`.
* Runtime harus dapat dijalankan di Node.js maupun browser tanpa perubahan.

---

## Impact

Terpengaruh:

* Semua `package.json`.
* Build pipeline.
* Workspace dependency graph.
* Aturan review code.

Tidak terpengaruh:

* Domain model.
* Event model.
* Runtime contracts.
