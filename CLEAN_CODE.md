# Clean Code Architecture: Frontend TELIS

Panduan ini mendeskripsikan struktur dan standar pengkodean (Clean Code) untuk repositori *frontend* Next.js App Router proyek TELIS.

## 1. Feature-Sliced Design (Domain-Driven)

Hindari menyimpan semua komponen di `components/` atau semua *hooks* di `hooks/`. Kelompokkan file berdasarkan **fitur/domain** bisnis.

Struktur folder:
```
features/
  ├── auth/
  │    ├── components/    # Komponen spesifik untuk Auth (LoginForm, dll)
  │    ├── hooks/         # Custom hooks (useLogin, useSession, dll)
  │    ├── schemas/       # Skema Zod (loginSchema, registerSchema)
  │    └── api/           # Fungsi fetch HTTP (Axios) untuk endpoint auth
  ├── documents/
  │    ├── components/    # (PDFViewer, DocumentList, dll)
  │    └── ...
```

### Aturan:
1.  **Isolasi**: Fitur `auth` tidak boleh mengimpor komponen privat dari fitur `documents`.
2.  **Global Components**: Simpan di `components/ui/` HANYA untuk komponen yang sangat umum dan dipakai ulang lintas fitur (seperti Button, Input, Card).

## 2. Separation of Concerns (Pemisahan Tugas)

Setiap *layer* memiliki tugas yang spesifik:

*   **Pages (`app/**/page.tsx`)**: HANYA boleh berisi *layouting*. Tidak boleh ada *state* (`useState`) atau pemanggilan *fetch* langsung di sini.
*   **Hooks (`features/**/hooks/`)**: Tempat berkumpulnya *logic* bisnis, pengolahan *state* React, dan pemanggilan API.
*   **Components (`features/**/components/`)**: "Dumb Components". Hanya bertugas merender UI dan menerima data/fungsi (*props*) dari hooks/parent.
*   **Schemas (`features/**/schemas/`)**: Tempat definisi *Validation Schema* (Zod) dan Tipe Data (TypeScript).

## 3. Naming Conventions

*   **Folder & File**: Gunakan `kebab-case` (contoh: `login-form.tsx`, `use-login.ts`).
*   **Komponen React**: Gunakan `PascalCase` (contoh: `LoginForm`).
*   **Fungsi & Variabel**: Gunakan `camelCase` (contoh: `onSubmit`, `isLoading`).
*   **Konstanta & Environment**: Gunakan `UPPER_SNAKE_CASE` (contoh: `MAX_FILE_SIZE`).

## 4. Error Handling & Prop Drilling

*   Jangan meneruskan *props* lebih dari 3 tingkat ke bawah (*prop drilling*). Gunakan `Zustand` untuk mengelola *Global State*.
*   Selalu gunakan *Try-Catch* di setiap pemanggilan API, dan kembalikan *error message* yang manusiawi ke UI.
