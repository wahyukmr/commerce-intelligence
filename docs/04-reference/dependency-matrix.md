# Dependency Matrix

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Reference

---

# Purpose

Dokumen ini menjadi referensi resmi mengenai dependency yang diperbolehkan antar layer dan package di dalam repository.

Gunakan dokumen ini ketika menambahkan dependency baru atau melakukan review arsitektur.

Untuk penjelasan mengenai alasan di balik aturan ini, lihat **Dependency Management**.

---

# Layer Dependency Matrix

| Consumer | Types | Utils | UI | Application |
|-----------|:-----:|:-----:|:--:|:-----------:|
| **Types** | ✅ | ❌ | ❌ | ❌ |
| **Utils** | ✅ | ✅ | ❌ | ❌ |
| **UI** | ✅ | ✅ | ✅ | ❌ |
| **Application** | ✅ | ✅ | ✅ | ✅ |

---

# Dependency Direction

Repository menggunakan dependency satu arah.

```text
Application

↓

UI

↓

Utils

↓

Types
```

Dependency hanya boleh mengarah ke bawah.

---

# Allowed Dependencies

## Types

May depend on

- —

Must not depend on

- Utilities
- UI
- Applications

---

## Utilities

May depend on

- Types

Must not depend on

- UI
- Applications

---

## UI

May depend on

- Utilities
- Types

Must not depend on

- Applications

---

## Applications

May depend on

- UI
- Utilities
- Types

Applications merupakan layer paling atas.

---

# Dependency Categories

| Category | Purpose |
|----------|---------|
| Runtime | Digunakan saat aplikasi berjalan |
| Development | Digunakan saat proses development |
| Peer | Disediakan oleh consumer |
| Workspace | Dependency antar package di repository |

---

# Circular Dependency Policy

Circular dependency tidak diperbolehkan.

```text
A

↓

B

↓

C
```

Valid.

```text
A

↓

B

↑

C
```

Tidak valid.

---

# Public API Rule

Dependency hanya boleh menggunakan public API package.

Tidak diperbolehkan mengimpor module internal.

Valid.

```text
@my/utils
```

Tidak valid.

```text
@my/utils/src/internal
```

---

# Review Questions

Sebelum menambahkan dependency baru.

- Apakah dependency mengikuti layer?
- Apakah dependency benar-benar diperlukan?
- Apakah public API sudah cukup?
- Apakah dependency menyebabkan circular dependency?
- Apakah responsibility package tetap jelas?

---

# Quick Decision Table

| Pertanyaan | Jawaban |
|------------|---------|
| Bolehkah UI memakai Utils? | ✅ |
| Bolehkah Utils memakai UI? | ❌ |
| Bolehkah Types memakai Utils? | ❌ |
| Bolehkah Application memakai UI? | ✅ |
| Bolehkah Application memakai Types? | ✅ |
| Bolehkah import module internal? | ❌ |

