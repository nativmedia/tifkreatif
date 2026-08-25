# CLAUDE.md — Panduan pengembangan TIFKREATIF

## Perintah
- `npm run dev` (auto-seed) · `build` · `start` · `lint` · `typecheck` · `test` (vitest) · `db:reset`

## Arsitektur (jangan dilanggar)
- Baca data: **hanya** lewat `src/lib/repos/*`. Tulis data: **hanya** lewat `src/lib/actions/*`.
- Pola action: `"use server"` → `requireUser()/requireAdmin()` → zod (`src/lib/validation.ts`) → `checkRateLimit` bila publik → repo → `revalidatePath`/`redirect`. **`redirect()` tidak boleh di dalam try/catch.**
- Transisi status pesanan hanya lewat `transitionOrder()` yang membaca `ORDER_TRANSITIONS` (`src/lib/constants.ts`). Jangan UPDATE status manual.
- Kepemilikan dicek di server (isOrderParty, `provider_id = ?`), bukan hanya disembunyikan di UI.
- Next.js 16: `params`/`searchParams` adalah **Promise — wajib `await`**. Aksi tombol di server component: `form action={fn.bind(null, …)}`.
- DB: better-sqlite3 singleton `getDb()` (WAL, FK on). Tidak ada Prisma; tidak ada middleware edge (guard di layout/page).

## Konvensi
- Bahasa antarmuka: Indonesia, hangat, jelas; sapaan "kamu". Uang selalu `formatRupiah`.
- Styling: token `@theme` di `globals.css` (navy/red/gold/bone/sand). Komponen UI dari `src/components/ui`.
- Konten demo memakai `is_demo` + `<DemoBadge/>`; sampul karya = `<PortfolioCover seed=…/>` (SVG generatif).
- Form interaktif: client component + `useActionState`; form murni-aksi: bind server action.

## Testing
- Vitest + DB in-memory: `TIFKREATIF_TEST=1` di-set oleh `vitest.config.ts` (juga alias stub `server-only`). Fixture di `tests/helpers.ts`; `resetDb()` di `beforeEach`.

## Keputusan yang dipertahankan
- Tanpa react-hook-form (server actions + useActionState sudah cukup).
- Pembayaran: `payment_status='direct_agreement'` + banner jujur; gateway via `src/lib/payments.ts` (fase 2: Midtrans/Xendit).
- Migrasi Postgres/Supabase: `supabase/schema.sql` (belum dieksekusi ke instans nyata).
