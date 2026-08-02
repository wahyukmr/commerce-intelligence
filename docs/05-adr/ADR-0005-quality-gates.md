# ADR-0005: Quality Gates

> Status: Accepted
>
> Date: 2026-08-02

---

## Context

Repository ini ditujukan sebagai production-grade open-source project. Diperlukan standar kualitas yang konsisten agar perubahan kode tetap aman seiring bertambahnya kompleksitas dan jumlah contributor.

---

## Decision

- Local workflow hanya menjalankan formatting dan lint pada file yang di-stage.
- CI menjadi sumber validasi utama.
- Pull request wajib lulus:
  - Install
  - Typecheck
  - Lint
  - Test
  - Build
- Runtime wajib memiliki unit test.
- Snapshot testing tidak digunakan.
- Regression test wajib ditambahkan untuk setiap bug yang diperbaiki.

---

## Alternatives Considered

### Menjalankan seluruh test pada pre-commit

Rejected.

Developer experience akan menurun secara signifikan seiring bertambahnya jumlah test.

### Menggunakan minimum coverage global

Rejected.

Coverage bukan indikator kualitas yang cukup. Fokus diarahkan pada perilaku sistem dan pengujian public API.

---

## Consequences

### Positif

- Commit tetap cepat.
- CI menjadi konsisten.
- Repository lebih mudah dipelihara.

### Negatif

- Sebagian kesalahan baru diketahui setelah push.

---

## Implementation Notes

- Husky hanya menjalankan lint-staged.
- Commit message divalidasi menggunakan commitlint.
- CI menjalankan validasi penuh.

---

## Impact

Terpengaruh

- Developer workflow
- GitHub Actions
- Review process

Tidak Terpengaruh

- Runtime
- Domain
- Dashboard
