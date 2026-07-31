# ADR-0002: Engineering Standards

> Status: Accepted
>
> Date: 2026-07-31

---

## Context

Repository ini merupakan monorepo dengan beberapa package dan aplikasi. Seluruh developer harus menggunakan toolchain yang konsisten agar konfigurasi tetap sederhana, proses build dapat diprediksi, dan biaya maintenance rendah.

---

## Decision

- Menggunakan pnpm sebagai package manager.
-Menggunakan Turborepo sebagai workspace orchestrator.
-Menggunakan TypeScript dengan `strict: true`.
- Menggunakan Biome sebagai formatter dan linter.
- Menggunakan Vitest untuk unit testing.
- Menggunakan tsup untuk build library.
- Menggunakan Changesets untuk versioning dan release.
- Menggunakan GitHub Actions untuk CI.
- Menggunakan Conventional Commits.
- Dokumentasi disimpan dalam repository menggunakan Markdown.

---

## Alternatives Considered

### npm Workspace

**Rejected**

Alasan: Tidak seefisien pnpm untuk monorepo besar.

---

### Nx

**Rejected**

Alasan: Fitur yang disediakan jauh melebihi kebutuhan proyek saat ini.

---

### ESLint + Prettier

**Rejected**

Alasan: Memerlukan dua tool dan lebih banyak konfigurasi dibanding Biome.

---

### Jest

**Rejected**

Alasan: Lebih lambat dan kurang terintegrasi dengan ekosistem Vite dibanding Vitest.

---

## Consequences

Positif

- Toolchain konsisten di seluruh workspace.
- Konfigurasi lebih sederhana.
- Build dan test lebih cepat.
- Onboarding contributor lebih mudah.

Negatif

- Bergantung pada tool yang relatif baru seperti Biome.
- Perlu memperbarui konfigurasi jika ada perubahan besar pada toolchain di masa depan.

---

## Implementation Notes

- Semua package mewarisi `tsconfig.base.json`.
- Semua package menggunakan konfigurasi Biome dari root.
- Semua package harus lulus `typecheck`, `lint`, `test`, dan `build`.
- Hanya `src/index.ts` yang menjadi public API package.

---

## Impact

Terpengaruh:

- Seluruh workspace.
- Build pipeline.
- CI.
- Developer workflow.

Tidak terpengaruh:

- Arsitektur runtime.
- Domain model.
- Dashboard.
