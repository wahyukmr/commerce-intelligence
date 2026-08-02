# Naming Conventions

> Status: Approved
>
> Version: 1.0
>
> Owner: Platform Engineering
>
> Category: Reference

---

# Purpose

Dokumen ini mendefinisikan standar penamaan yang digunakan di seluruh repository.

Gunakan dokumen ini ketika membuat package, application, file, directory, module, atau identifier baru.

---

# Quick Lookup

| Item | Convention | Example |
|------|------------|---------|
| Package | `kebab-case` | `@my/utils` |
| Application | `kebab-case` | `admin-dashboard` |
| Directory | `kebab-case` | `user-profile` |
| File | `kebab-case` | `date-utils.ts` |
| React Component | `PascalCase` | `UserCard.tsx` |
| Class | `PascalCase` | `ApiClient` |
| Interface | `PascalCase` | `UserProfile` |
| Type Alias | `PascalCase` | `UserRole` |
| Enum | `PascalCase` | `OrderStatus` |
| Function | `camelCase` | `formatDate` |
| Method | `camelCase` | `findById` |
| Variable | `camelCase` | `currentUser` |
| Parameter | `camelCase` | `userId` |
| Property | `camelCase` | `createdAt` |
| Constant | `UPPER_SNAKE_CASE`* | `MAX_RETRY_COUNT` |
| Environment Variable | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| Generic Type | `PascalCase` | `TData`, `TError` |

\*Gunakan `UPPER_SNAKE_CASE` hanya untuk nilai yang benar-benar bersifat konstan. Nilai runtime yang tidak berubah selama eksekusi tetap menggunakan `camelCase`.

---

# Package Naming

Rules.

- gunakan `kebab-case`
- gunakan nama domain, bukan implementasi
- gunakan bentuk singular apabila memungkinkan
- hindari singkatan yang tidak umum

Valid.

```text
@my/utils
@my/ui
@my/config-env
```

Tidak valid.

```text
@my/helpers2
@my/misc
@my/stuff
```

---

# Application Naming

Rules.

- gunakan `kebab-case`
- gunakan nama yang menggambarkan fungsi aplikasi
- hindari nama berdasarkan teknologi

Valid.

```text
admin-dashboard
customer-portal
api-server
```

Tidak valid.

```text
react-app
node-app
frontend2
```

---

# Directory Naming

Rules.

- gunakan `kebab-case`
- gunakan nama yang menjelaskan isi direktori
- hindari karakter khusus dan spasi

Valid.

```text
user-profile
shared-components
```

---

# File Naming

## Source Files

Gunakan `kebab-case`.

```text
date-utils.ts
string-builder.ts
```

---

## React Components

Gunakan `PascalCase`.

```text
UserCard.tsx
NavigationMenu.tsx
```

Nama file harus sama dengan nama component utama yang diekspor.

---

## Test Files

Gunakan nama file sumber sebagai dasar.

```text
date-utils.test.ts
date-utils.spec.ts
```

Repository harus memilih salah satu pola dan menggunakannya secara konsisten.

---

# Identifier Naming

## Variables

```ts
const currentUser = ...
const retryCount = ...
```

---

## Functions

```ts
function calculateTotal() {}

function validateInput() {}
```

Gunakan kata kerja yang menjelaskan aksi.

---

## Boolean Values

Awali dengan kata yang menunjukkan kondisi.

```ts
isLoading
isEnabled
hasPermission
canDelete
shouldRetry
```

---

## Collections

Gunakan bentuk jamak.

```ts
users
products
roles
```

---

## Callbacks

Gunakan awalan yang menjelaskan peristiwa.

```ts
onClick
onSubmit
onChange
```

---

# Type Naming

Gunakan `PascalCase`.

```ts
type User = ...

interface UserRepository {}

class UserService {}
```

Hindari awalan atau akhiran yang tidak memberikan makna.

Tidak disarankan.

```text
IUser
UserInterface
UserType
```

---

# Generic Type Naming

Gunakan nama yang deskriptif bila memungkinkan.

```ts
Repository<TUser>

ApiResponse<TData>
```

Untuk generic sederhana, gunakan pola.

```text
T
TData
TValue
TResult
TError
```

---

# Module Naming

Nama module harus menggambarkan domain.

Valid.

```text
authentication
notification
billing
```

Tidak valid.

```text
common
misc
temp
helpers
```

---

# Abbreviation Policy

Gunakan singkatan hanya jika sudah menjadi istilah umum.

Disarankan.

```text
API
URL
HTTP
JSON
HTML
ID
```

Hindari singkatan internal yang hanya dipahami sebagian kecil tim.

---

# Rules

- Gunakan satu konvensi untuk setiap kategori.
- Hindari nama yang terlalu umum.
- Nama harus mencerminkan domain, bukan implementasi.
- Hindari penomoran sebagai pembeda (`service2`, `utils3`).
- Pilih nama yang tetap relevan meskipun implementasi berubah.

---

# Examples

| Good | Avoid |
|------|-------|
| `user-service` | `service-new` |
| `formatCurrency` | `doFormat` |
| `UserCard` | `Card2` |
| `isAuthenticated` | `flag` |
| `customer-portal` | `react-app` |

