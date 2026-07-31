# ADR-0001: Repository Structure

> Status: Accepted
>
> Date: YYYY-MM-DD
>
> Decision Makers: Platform Engineering
>
> Supersedes: —
>
> Superseded By: —

---

## Context

Repository ini akan berkembang dari V1 (local simulation) menuju V2 (production SaaS). Diperlukan struktur yang mampu memisahkan aplikasi, library reusable, tooling, dan dokumentasi tanpa menciptakan dependency yang sulit dipelihara.

---

## Decision

- Repository menggunakan pnpm workspace.
- Executable berada di `apps/`.
- Reusable library berada di `packages/`.
- `runtime` bersifat framework-agnostic dan domain-agnostic.
- `commerce` berisi capability domain.
- `simulation` merupakan adapter.
- `shared` hanya berisi utilitas lintas domain.
- Setiap package hanya memiliki satu public entry point (`src/index.ts`).
- Import ke `internal/` package lain dilarang.
- Dependency mengikuti dependency matrix yang telah ditetapkan.

---

## Alternatives Considered

### Option A — Single Package Repository

Satu aplikasi React dengan seluruh kode berada di dalam `src/`.

**Rejected**

Alasan:

- Sulit dipisahkan menjadi reusable library.
- Runtime menjadi terikat dengan dashboard.
- Tidak sesuai dengan target jangka panjang.

---

### Option B — Package per Capability

Misalnya:
`packages/`
`revenue/`
`retention/`
`inventory/`


**Rejected (untuk V1)**

Alasan:

- Terlalu banyak package sejak awal.
- Menambah kompleksitas dependency.
- Belum memiliki kebutuhan operasional yang nyata.

---

### Option C — Domain Package

`packages/`
`commerce/`


Submodule domain berada di dalam package tersebut.

**Accepted**

Karena memberikan keseimbangan antara modularitas dan kompleksitas.

---

## Consequences

Positif

- Repository mudah dipahami.
- Dependency lebih jelas.
- Runtime dapat digunakan kembali.
- Mudah berkembang menjadi multi-app.

Negatif

- Package `commerce` akan menjadi cukup besar.
- Pemisahan menjadi package tersendiri mungkin diperlukan di masa depan.

---

## Implementation Notes

Aturan implementasi yang harus dipatuhi.

- Apps hanya boleh mengimpor public API package.
- Runtime tidak boleh mengimpor commerce.
- Shared tidak boleh mengimpor package lain.
- Folder `internal/` dianggap private.
- Seluruh package wajib memiliki `src/index.ts`.

---

## Impact

Terpengaruh:

- Seluruh struktur repository.
- Dependency graph.
- Build system.
- Workspace configuration.
- Import convention.

Tidak terpengaruh:

- Implementasi runtime.
- Dashboard UI.
- Business logic.
- Simulation algorithm.
