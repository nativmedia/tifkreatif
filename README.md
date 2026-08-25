# TIFKREATIF — Marketplace Jasa Kreatif Madura

> **Temukan Talenta Kreatif Madura.** Fotografer, desainer, videografer, hingga kreator AI dari
> Bangkalan, Sampang, Pamekasan, dan Sumenep — satu tempat untuk mencari, menyepakati,
> mengerjakan, dan menyelesaikan proyek kreatif.

Ini adalah **MVP fungsional penuh**: dua sisi marketplace (klien ↔ talenta) berjalan end-to-end
di atas Next.js + SQLite, lengkap dengan data demo berlabel, panel admin, dan jalur migrasi ke
Supabase/Postgres.

---

## Mulai dalam 60 detik

```bash
npm install
npm run dev
```

Buka **http://localhost:3000** — database SQLite dibuat otomatis di `data/tifkreatif.db` dan
langsung ter-seed data demo saat pertama kali dijalankan (matikan dengan `AUTO_SEED=false`).

### Akun demo (kata sandi semua: `demo1234`)

| Peran   | Email                        | Untuk mencoba apa                                                          |
| ------- | ---------------------------- | -------------------------------------------------------------------------- |
| Klien   | `klien@demo.tifkreatif.id`   | Dashboard klien, terima/tolak proposal, setujui hasil `ord-c`, beri ulasan  |
| Talenta | `talenta@demo.tifkreatif.id` | Dashboard talenta, brief masuk, kirim hasil `ord-a`, kelola layanan         |
| Admin   | `admin@demo.tifkreatif.id`   | Verifikasi talenta, tangani laporan, moderasi layanan, kelola pengguna      |

**Skenario demo siap-klik:**
1. Masuk sebagai **klien** → *Pesanan* → `Landing page katalog Kopi Losari` (status *Hasil dikirim*) → coba **Minta revisi** atau **Setujui & selesaikan** lalu beri ulasan.
2. Masuk sebagai **klien** → *Proyek Saya* → `Konten Instagram Ramadan…` → **Terima** salah satu dari 2 proposal → ruang pesanan otomatis terbentuk.
3. Masuk sebagai **talenta** → *Ringkasan* → ada brief langsung `Prewedding di Pantai Lombang` dan permintaan pesanan baru dari Budi → balas/terima.
4. Masuk sebagai **admin** → 2 permintaan verifikasi & 1 laporan menunggu keputusanmu.

---

## Fitur MVP

**Publik & pencarian**
- Beranda dengan pencarian, kategori (16), talenta pilihan, layanan unggulan, proyek terbuka, ulasan, FAQ.
- `/talenta`: filter kata kunci, kategori, kabupaten, harga mulai, rating, terverifikasi, ketersediaan + 4 mode urut + pagination (semua lewat URL, bisa dibagikan).
- Profil talenta: portofolio (sampul SVG generatif), layanan, ulasan, badge *Terverifikasi*, favorit, **brief langsung**, laporkan.
- Detail layanan: paket Basic/Standard/Premium, add-on, pemesanan paket.
- `/proyek`: papan proyek terbuka + detail + kirim proposal (satu talenta satu proposal; brief langsung terkunci untuk talenta tujuan).

**Transaksi**
- Tiga jalur masuk pesanan: pesan paket → *inquiry*; brief langsung → proposal; proyek terbuka → proposal → terima.
- **Ruang pesanan** `/pesanan/[id]`: status + tombol transisi sesuai peran, milestone (buat/mulai/selesai), kirim hasil + lampiran (PNG/JPG/WebP/PDF/ZIP ≤ 8 MB), permintaan revisi, ulasan (unik, hanya setelah selesai), log aktivitas, tautan chat.
- Alur status **ditegakkan di server** per peran: `inquiry → negotiation → accepted → active → submitted → (completed | revision_requested → submitted)`; pembatalan oleh kedua pihak sebelum *submitted*.
- Chat per pesanan (polling 5 dtk), notifikasi in-app, penanda belum dibaca di header.

**Akun & admin**
- Registrasi klien/talenta, sesi cookie httpOnly 30 hari, rate limit (login, registrasi, pesan, proposal, brief, laporan, ulasan).
- Dashboard klien (proyek, proposal masuk, pesanan, favorit) & talenta (brief, proposal, pesanan, CRUD layanan 3-paket, portofolio, ajukan verifikasi).
- Panel admin: statistik, verifikasi talenta, laporan konten, moderasi layanan, tangguhkan pengguna, CRUD kategori.
- SEO dasar: metadata per halaman, `sitemap.xml` dinamis (±54 URL), `robots.txt`; aksesibilitas: skip-link, label form, focus ring, `prefers-reduced-motion`.

---

## Skrip

| Perintah            | Fungsi                                        |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Development (auto-seed saat DB kosong)        |
| `npm run build`     | Build produksi                                |
| `npm run start`     | Jalankan hasil build                          |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | `tsc --noEmit`                                |
| `npm run test`      | Vitest (15 tes aturan bisnis, DB in-memory)   |
| `npm run db:seed`   | Seed manual (dilewati jika DB sudah berisi)   |
| `npm run db:reset`  | Hapus DB lalu seed ulang dari nol             |

`.env.example` → salin ke `.env.local` bila perlu (`SESSION_SECRET`, `AUTO_SEED`, placeholder Supabase/payment untuk fase berikutnya). Tanpa env pun aplikasi jalan.

---

## Arsitektur

```
src/
├─ app/                    # App Router (42 route)
│  ├─ (publik)  /, talenta, layanan, proyek, masuk, daftar, statis…
│  ├─ dashboard/           # klien & talenta (guard di layout+page)
│  ├─ pesanan/[id]/        # ruang kerja pesanan
│  ├─ pesan/, notifikasi/, admin/
│  └─ files/[id]/route.ts  # unduh lampiran (cek pihak pesanan)
├─ components/             # ui primitives, cards, forms (client), chrome, covers
└─ lib/
   ├─ schema.ts            # DDL SQLite (24 tabel, CHECK & index)
   ├─ db.ts                # singleton better-sqlite3 (WAL) + auto-seed
   ├─ auth.ts              # bcryptjs + sesi cookie httpOnly `tif_session`
   ├─ constants.ts         # ORDER_TRANSITIONS (mesin status), label UI
   ├─ validation.ts        # skema zod semua form
   ├─ repos/               # semua akses data (catalog, orders, projects, …)
   └─ actions/             # server actions: sesi → zod → rate limit → repo
```

**Pola kunci:** UI server component membaca lewat `repos/`; semua tulisan lewat `actions/`
("use server") dengan urutan *autentikasi → validasi zod → rate limit → mutasi → revalidate/redirect*.
Kepemilikan selalu dicek ulang di server (mis. `isOrderParty`, `provider_id = ?` di UPDATE).

**Keputusan penting (dan alasannya):**
- **better-sqlite3, bukan Prisma** — unduhan engine Prisma diblokir di lingkungan build; SQL eksplisit + tipe TS manual justru membuat aturan bisnis mudah diuji.
- **Guard di layout/page, bukan middleware** — better-sqlite3 tidak berjalan di edge runtime.
- **UI primitives tulisan tangan** (registry shadcn tidak dapat diakses saat build) dengan Tailwind v4 `@theme`.
- **Sampul generatif SVG** bermotif "tenun pesisir" untuk semua konten demo — jujur bahwa ini ilustrasi, bukan foto karya sungguhan (ada keterangannya di UI).
- **Chat = polling `router.refresh()`** — cukup untuk MVP, tanpa infra websocket.
- Semua akun & ulasan seed diberi flag `is_demo` dan **berlabel "Demo" di antarmuka**.

---

## Batasan versi MVP (jujur)

- **Pembayaran belum ada.** Status pesanan memakai `payment_status = direct_agreement`; UI menampilkan banner bahwa pembayaran disepakati langsung di luar platform. Abstraksi `src/lib/payments.ts` siap disambungkan ke **Midtrans/Xendit** (escrow) di fase berikutnya.
- **Upload file lokal** (`data/uploads`, maks 8 MB) — untuk produksi pindah ke object storage (Supabase Storage) dengan URL bertanda tangan.
- **Reset kata sandi belum ada** (butuh layanan email) — halaman `/lupa-password` menjelaskannya apa adanya.
- **SQLite file tunggal** — pas untuk MVP/single-instance; jalur migrasi Postgres disiapkan (lihat bawah).
- Chat polling (bukan realtime), tanpa OAuth, tanpa unggah gambar portofolio (sampul generatif dulu).

## Migrasi ke Supabase

`supabase/schema.sql` berisi skema Postgres lengkap (enum, relasi, index) plus **RLS** (policy per tabel: katalog publik, brief langsung hanya pihak terkait, pesan hanya anggota percakapan, dsb.) dan fungsi bantu `is_admin() / is_order_party() / is_conversation_member()`. Catatan jujur: file ini deliverable migrasi dan **belum dieksekusi ke instans Supabase nyata** (lingkungan build tidak memiliki kredensial) — tinjau sebelum dipakai. Auth berpindah ke Supabase Auth; pembuatan order multi-tabel disarankan lewat RPC `security definer`.

## Kualitas & verifikasi

- `lint` ✅ 0 error/warning · `typecheck` ✅ bersih · `build` ✅ 42 route · `test` ✅ 15/15.
- Verifikasi runtime (`next start` + curl): 30+ pemeriksaan — halaman publik 200 dengan data seed nyata, 404 kustom, redirect guard `?next=`, pemisahan peran (klien ⇄ talenta ⇄ admin), 404 untuk non-pihak pesanan, `files/[id]` 401 tanpa sesi, sitemap 54 URL.
- Catatan: verifikasi **visual di browser sungguhan tidak tersedia** di lingkungan build ini (binary browser Playwright tidak dapat diunduh), sehingga interaksi klik diuji lewat unit test aturan bisnis + pemeriksaan HTTP di atas.

---

*Dibuat dengan bangga dari Madura. Konten contoh diberi label "Demo".* 🏝️
