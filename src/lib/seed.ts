/**
 * Seed data demo TIFKREATIF.
 * Semua akun/konten di sini adalah DATA DEMO (users.is_demo = 1, reviews.is_demo = 1)
 * dan diberi label "Demo" di antarmuka. Tidak memakai identitas orang nyata.
 *
 * Akun demo (kata sandi semua: demo1234):
 *   klien@demo.tifkreatif.id    — Client  (Aisyah Putri, UMKM Kopi Losari, Bangkalan)
 *   talenta@demo.tifkreatif.id  — Provider (Ahmad Rofiqi / @rofiqivisual, Bangkalan)
 *   admin@demo.tifkreatif.id    — Admin
 */
import type { Database } from "better-sqlite3";
import bcrypt from "bcryptjs";

function iso(daysAgo: number, hourOffset = 0): string {
  const d = new Date(Date.now() - daysAgo * 86400_000 + hourOffset * 3600_000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export function runSeed(db: Database): void {
  const passwordHash = bcrypt.hashSync("demo1234", 10);

  const ins = (table: string, row: Record<string, unknown>) => {
    const keys = Object.keys(row);
    db.prepare(
      `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`
    ).run(...keys.map((k) => row[k]));
  };

  const seedAll = db.transaction(() => {
    /* ── Kategori ─────────────────────────────────────────────── */
    const cats: [string, string, string, string][] = [
      ["desain-grafis", "Desain Grafis", "Feed, poster, banner, dan materi promosi.", "palette"],
      ["branding-logo", "Branding & Logo", "Logo, identitas visual, dan brand guideline.", "fingerprint"],
      ["fotografi", "Fotografi", "Wedding, keluarga, acara, dan potret.", "camera"],
      ["videografi", "Videografi", "Video promosi, profil, dan sinematik.", "video"],
      ["editing-video", "Editing Video", "Reels, TikTok, YouTube, dan color grading.", "film"],
      ["animasi-motion", "Animasi & Motion Graphic", "Explainer, bumper, dan animasi logo.", "wand-sparkles"],
      ["social-media", "Social Media Management", "Strategi, konten, dan pengelolaan akun.", "megaphone"],
      ["foto-video-produk", "Foto & Video Produk", "Katalog, marketplace, dan konten jualan.", "shopping-bag"],
      ["website-uiux", "Website & UI/UX", "Company profile, landing page, dan desain aplikasi.", "monitor-smartphone"],
      ["ilustrasi", "Ilustrasi", "Karakter, maskot, dan ilustrasi editorial.", "pen-tool"],
      ["3d-visualisasi", "3D & Visualisasi", "Booth, interior, dan render produk.", "boxes"],
      ["creative-ai", "Creative AI", "Eksplorasi visual dan konten berbantuan AI.", "sparkles"],
      ["percetakan-merchandise", "Percetakan & Merchandise", "Kaos, merchandise, dan kebutuhan cetak.", "printer"],
      ["dokumentasi-acara", "Dokumentasi Acara", "Liputan foto-video acara dan seremoni.", "calendar-days"],
      ["voice-over-audio", "Voice Over & Audio", "Pengisi suara, jingle, dan mixing audio.", "mic"],
      ["kreatif-lainnya", "Kreatif Lainnya", "Kebutuhan kreatif lain di luar kategori di atas.", "shapes"],
    ];
    cats.forEach(([slug, name, description, icon], i) =>
      ins("categories", { id: `cat-${slug}`, name, slug, description, icon, is_active: 1, sort_order: (i + 1) * 10 })
    );
    const cat = (slug: string) => `cat-${slug}`;

    /* ── Pengguna ─────────────────────────────────────────────── */
    type P = {
      id: string; email: string; name: string; username: string; kab: string;
      headline: string; bio: string; verified: 0 | 1; resp: number; hue: number;
      areas: string[]; skills: string[]; avail?: "tersedia" | "sibuk" | "libur";
    };
    const providers: P[] = [
      { id: "u-rofiqi", email: "talenta@demo.tifkreatif.id", name: "Ahmad Rofiqi", username: "rofiqivisual", kab: "Bangkalan", verified: 1, resp: 2, hue: 8, avail: "tersedia",
        headline: "Fotografer wedding & dokumentasi acara di Bangkalan", areas: ["Bangkalan", "Sampang", "Surabaya"], skills: ["fotografi", "videografi", "dokumentasi-acara"],
        bio: "Sepuluh tahun mendokumentasikan momen keluarga Madura — dari lamaran di rumah joglo sampai resepsi di gedung. Gaya candid, hangat, dan rapi saat serah terima file." },
      { id: "u-karapan", email: "studiokarapan@demo.tifkreatif.id", name: "Nadia Amalia", username: "studiokarapan", kab: "Bangkalan", verified: 1, resp: 4, hue: 210,
        headline: "Studio branding untuk UMKM yang mau naik kelas", areas: ["Bangkalan", "Surabaya", "Luar Madura"], skills: ["branding-logo", "desain-grafis"],
        bio: "Studio Karapan membantu usaha lokal tampil setara brand nasional: riset singkat, logo yang bisa dipertanggungjawabkan, dan panduan pemakaian yang mudah diikuti tim internal." },
      { id: "u-bagus", email: "bagusmotion@demo.tifkreatif.id", name: "Bagus Firmansyah", username: "bagusmotion", kab: "Bangkalan", verified: 0, resp: 6, hue: 260,
        headline: "Editor Reels/TikTok & motion graphic ringan", areas: ["Bangkalan", "Luar Madura"], skills: ["editing-video", "animasi-motion"],
        bio: "Fokus di konten pendek yang enak ditonton: cutting rapat, subtitle rapi, dan motion seperlunya. Terbiasa kerja remote dengan brief lewat chat." },
      { id: "u-lensa", email: "lensasampang@demo.tifkreatif.id", name: "Siti Maisaroh", username: "lensasampang", kab: "Sampang", verified: 1, resp: 3, hue: 150,
        headline: "Foto produk & menu untuk jualan online", areas: ["Sampang", "Pamekasan", "Bangkalan"], skills: ["foto-video-produk", "fotografi"],
        bio: "Membantu pemilik warung dan toko online punya foto yang bikin lapar dan bikin klik. Studio mini portabel, bisa datang ke lokasi usaha." },
      { id: "u-hafid", email: "hafidweb@demo.tifkreatif.id", name: "Hafid Ramadhan", username: "hafidweb", kab: "Sampang", verified: 0, resp: 8, hue: 190,
        headline: "Website company profile & landing page cepat", areas: ["Sampang", "Luar Madura"], skills: ["website-uiux"],
        bio: "Developer web yang peduli kecepatan dan kemudahan diedit. Semua website diserahkan lengkap dengan panduan singkat untuk pemiliknya." },
      { id: "u-ilustra", email: "ruangilustra@demo.tifkreatif.id", name: "Dina Kamalia", username: "ruangilustra", kab: "Sampang", verified: 0, resp: 12, hue: 300,
        headline: "Ilustrator karakter, maskot, dan konsep visual", areas: ["Sampang", "Luar Madura"], skills: ["ilustrasi", "creative-ai"],
        bio: "Menggambar maskot yang punya cerita — bukan sekadar lucu. Terbuka untuk eksplorasi gaya, termasuk alur kerja berbantuan AI yang tetap jujur ke klien." },
      { id: "u-batikpixel", email: "batikpixel@demo.tifkreatif.id", name: "Moh. Syafii", username: "batikpixel", kab: "Pamekasan", verified: 1, resp: 4, hue: 20,
        headline: "Desain grafis harian & kebutuhan cetak UMKM", areas: ["Pamekasan", "Sampang", "Sumenep"], skills: ["desain-grafis", "percetakan-merchandise"],
        bio: "Dari feed Instagram sampai spanduk 3 meter — satu pintu untuk desain dan cetaknya sekalian. Langganan tetap banyak toko batik di Pamekasan." },
      { id: "u-arek", email: "arekvideo@demo.tifkreatif.id", name: "Rizal Maulana", username: "arekvideo", kab: "Pamekasan", verified: 0, resp: 6, hue: 230, avail: "sibuk",
        headline: "Videografer promosi UMKM & wisata Madura", areas: ["Pamekasan", "Sumenep"], skills: ["videografi", "editing-video"],
        bio: "Suka bercerita lewat gambar bergerak. Portofolio banyak di video kuliner, wisata pantai, dan profil usaha keluarga." },
      { id: "u-suara", email: "suaramadura@demo.tifkreatif.id", name: "Laila Fitriani", username: "suaramadura", kab: "Pamekasan", verified: 0, resp: 5, hue: 330,
        headline: "Voice over Bahasa Indonesia & Madura", areas: ["Pamekasan", "Luar Madura"], skills: ["voice-over-audio"],
        bio: "Pengisi suara untuk iklan radio, video profil, dan sentra PKL. Bisa logat Madura halus atau Indonesia formal, rekaman home studio jernih." },
      { id: "u-keraton", email: "keratonkreatif@demo.tifkreatif.id", name: "Fauzan Alfarizi", username: "keratonkreatif", kab: "Sumenep", verified: 1, resp: 3, hue: 45,
        headline: "Agensi kecil: brand & media sosial terkelola", areas: ["Sumenep", "Pamekasan", "Surabaya"], skills: ["branding-logo", "social-media"],
        bio: "Tim tiga orang di Sumenep yang mengelola akun media sosial belasan usaha lokal. Laporan bulanan jelas: apa yang dikerjakan, apa hasilnya." },
      { id: "u-nara", email: "narafoto@demo.tifkreatif.id", name: "Intan Permatasari", username: "narafoto", kab: "Sumenep", verified: 0, resp: 4, hue: 120,
        headline: "Fotografer keluarga, wisuda, dan potret", areas: ["Sumenep"], skills: ["fotografi", "dokumentasi-acara"],
        bio: "Percaya setiap keluarga berhak punya foto yang layak dicetak besar. Sesi santai, arahan gaya sabar, hasil dikirim rapi per album." },
      { id: "u-tiga", email: "tigadimensi@demo.tifkreatif.id", name: "Yusuf Hidayat", username: "tigadimensi", kab: "Sumenep", verified: 0, resp: 10, hue: 275,
        headline: "Visualisasi 3D booth, interior, dan produk", areas: ["Sumenep", "Surabaya", "Luar Madura"], skills: ["3d-visualisasi"],
        bio: "Membantu event organizer dan pemilik usaha melihat booth atau ruangannya sebelum dibangun. Render realistis, revisi terarah." },
    ];

    const clients = [
      { id: "u-aisyah", email: "klien@demo.tifkreatif.id", name: "Aisyah Putri", kab: "Bangkalan", type: "umkm", company: "Kopi Losari", hue: 95 },
      { id: "u-budi", email: "budi@demo.tifkreatif.id", name: "Budi Santoso", kab: "Sumenep", type: "perusahaan", company: "CV Madura Jaya", hue: 205 },
      { id: "u-fitri", email: "fitri@demo.tifkreatif.id", name: "Fitri Handayani", kab: "Pamekasan", type: "individu", company: null, hue: 320 },
      { id: "u-mahmud", email: "mahmud@demo.tifkreatif.id", name: "H. Mahmud Ridwan", kab: "Pamekasan", type: "umkm", company: "Batik Tresna", hue: 30 },
    ] as const;

    for (const c of clients) {
      ins("users", { id: c.id, email: c.email, password_hash: passwordHash, role: "client", is_demo: 1, created_at: iso(120) });
      ins("profiles", { user_id: c.id, full_name: c.name, kabupaten: c.kab, avatar_hue: c.hue, created_at: iso(120), updated_at: iso(120) });
      ins("client_profiles", { user_id: c.id, client_type: c.type, company_name: c.company });
    }

    for (const p of providers) {
      ins("users", { id: p.id, email: p.email, password_hash: passwordHash, role: "provider", is_demo: 1, created_at: iso(150) });
      ins("profiles", { user_id: p.id, full_name: p.name, kabupaten: p.kab, bio: p.bio, avatar_hue: p.hue, created_at: iso(150), updated_at: iso(150) });
      ins("provider_profiles", {
        user_id: p.id, username: p.username, headline: p.headline, is_verified: p.verified,
        response_time_hours: p.resp, availability: p.avail ?? "tersedia",
        service_areas: JSON.stringify(p.areas), created_at: iso(150),
      });
      p.skills.forEach((s) => ins("provider_skills", { id: `sk-${p.username}-${s}`, provider_id: p.id, category_id: cat(s) }));
    }

    ins("users", { id: "u-admin", email: "admin@demo.tifkreatif.id", password_hash: passwordHash, role: "admin", is_demo: 1, created_at: iso(150) });
    ins("profiles", { user_id: "u-admin", full_name: "Admin TIFKREATIF", kabupaten: "Bangkalan", avatar_hue: 0, created_at: iso(150), updated_at: iso(150) });

    /* ── Layanan & paket ──────────────────────────────────────── */
    type Pkg = ["basic" | "standard" | "premium", string, number, string, string[], number, number];
    const addService = (
      id: string, provider: string, category: string, title: string, slug: string,
      description: string, days: number, rev: number, pkgs: Pkg[], addons: [string, number][] = []
    ) => {
      ins("services", {
        id, provider_id: provider, category_id: cat(category), title, slug,
        description, estimated_days: days, revision_count: rev, is_active: 1, created_at: iso(90),
      });
      pkgs.forEach(([tier, name, price, desc, del, d, r]) =>
        ins("service_packages", {
          id: `${id}-${tier}`, service_id: id, tier, name, price, description: desc,
          deliverables: JSON.stringify(del), estimated_days: d, revision_count: r,
        })
      );
      addons.forEach(([name, price], i) => ins("service_addons", { id: `${id}-ad${i}`, service_id: id, name, price }));
    };

    addService("svc-wedding", "u-rofiqi", "fotografi", "Paket Foto Wedding & Lamaran", "paket-foto-wedding-lamaran",
      "Dokumentasi hari istimewa dengan gaya candid yang hangat. Termasuk konsultasi rundown, pendampingan dari persiapan sampai acara inti, dan kurasi foto siap cetak. Berpengalaman dengan adat pernikahan Madura.", 14, 2,
      [
        ["basic", "Akad / Lamaran", 1_500_000, "1 fotografer, 4 jam liputan.", ["150+ foto terkurasi", "40 foto edit penuh", "Galeri online 1 tahun"], 10, 1],
        ["standard", "Akad + Resepsi", 2_800_000, "2 fotografer, liputan seharian.", ["300+ foto terkurasi", "80 foto edit penuh", "Cetak album mini 20 halaman", "Galeri online 1 tahun"], 14, 2],
        ["premium", "Full Day + Video", 4_500_000, "2 fotografer + 1 videografer.", ["400+ foto terkurasi", "Video highlight 3–5 menit", "Album magnetik 30 halaman", "Flashdisk kemasan eksklusif"], 21, 2],
      ], [["Sesi prewedding 2 jam", 900_000], ["Cetak kanvas 60×40", 350_000]]);

    addService("svc-dokumentasi", "u-rofiqi", "dokumentasi-acara", "Dokumentasi Acara & Seremoni", "dokumentasi-acara-seremoni",
      "Liputan foto untuk khitanan, pengajian, ulang tahun, hingga acara instansi. Tim datang lebih awal untuk memetakan momen penting, hasil dikirim terkurasi dan diberi nama folder yang rapi.", 7, 1,
      [
        ["basic", "Setengah Hari", 900_000, "1 fotografer, maksimal 4 jam.", ["120+ foto terkurasi", "30 foto edit penuh"], 5, 1],
        ["standard", "Sehari Penuh", 1_800_000, "2 fotografer, sampai 8 jam.", ["250+ foto terkurasi", "60 foto edit penuh", "Preview 10 foto H+1"], 7, 1],
      ]);

    addService("svc-logo", "u-karapan", "branding-logo", "Desain Logo & Identitas Brand", "desain-logo-identitas-brand",
      "Bukan sekadar gambar bagus: kami mulai dari cerita usahamu, kompetitor, dan pelanggan. Hasilnya logo yang punya alasan, lengkap dengan file master dan panduan pemakaian sederhana.", 10, 3,
      [
        ["basic", "Logo Esensial", 450_000, "2 alternatif konsep.", ["File PNG & SVG", "Varian warna & putih", "2x revisi"], 7, 2],
        ["standard", "Logo + Panduan", 950_000, "3 alternatif konsep.", ["Semua file master", "Mini brand guideline PDF", "Mockup aplikasi", "3x revisi"], 10, 3],
        ["premium", "Identitas Lengkap", 1_800_000, "Eksplorasi mendalam.", ["Brand guideline lengkap", "Kop surat & kartu nama", "Template feed 6 desain", "4x revisi"], 15, 4],
      ], [["Desain stationery tambahan", 250_000]]);

    addService("svc-kemasan", "u-karapan", "desain-grafis", "Desain Kemasan Produk UMKM", "desain-kemasan-produk-umkm",
      "Kemasan yang menjual di rak dan di foto katalog. Termasuk penyesuaian ukuran cetak, informasi wajib (PIRT, halal, komposisi), dan file siap kirim ke percetakan.", 7, 2,
      [
        ["basic", "1 Varian", 350_000, "Satu desain kemasan utama.", ["File cetak siap produksi", "Mockup 3D sederhana", "2x revisi"], 5, 2],
        ["standard", "3 Varian Rasa", 700_000, "Sistem desain untuk 3 varian.", ["3 file cetak", "Mockup katalog", "3x revisi"], 7, 3],
      ]);

    addService("svc-reels", "u-bagus", "editing-video", "Editing Video Reels & TikTok", "editing-video-reels-tiktok",
      "Kirim footage mentah dari HP, terima video pendek yang enak ditonton: cutting cepat, subtitle rapi, musik sesuai tren, dan ekspor sesuai rasio tiap platform.", 3, 2,
      [
        ["basic", "1 Video", 75_000, "Durasi sampai 60 detik.", ["Subtitle otomatis dirapikan", "1x revisi minor"], 2, 1],
        ["standard", "Paket 5 Video", 300_000, "Hemat untuk konten rutin.", ["5 video ≤60 detik", "Template subtitle konsisten", "2x revisi"], 4, 2],
        ["premium", "Paket 12 Video", 650_000, "Sebulan konten aman.", ["12 video ≤60 detik", "Cover/thumbnail tiap video", "3x revisi"], 7, 3],
      ]);

    addService("svc-motion", "u-bagus", "animasi-motion", "Motion Graphic Explainer 60 Detik", "motion-graphic-explainer-60-detik",
      "Jelaskan produk atau alur layanan dalam satu menit animasi. Termasuk penulisan naskah bersama, storyboard sederhana, dan dua putaran revisi terarah.", 12, 2,
      [
        ["basic", "Explainer Simpel", 850_000, "Gaya flat, aset template premium.", ["Video 60 detik 1080p", "Naskah & storyboard", "Musik berlisensi"], 10, 2],
        ["standard", "Explainer Custom", 1_600_000, "Ilustrasi aset dibuat khusus.", ["Video 60–90 detik", "Karakter sesuai brand", "File project"], 14, 2],
      ]);

    addService("svc-fotoproduk", "u-lensa", "foto-video-produk", "Foto Produk Katalog & Marketplace", "foto-produk-katalog-marketplace",
      "Foto produk latar bersih dan gaya lifestyle untuk Shopee, Tokopedia, dan Instagram. Bisa kirim produk ke studio atau kami datang ke lokasi usahamu.", 5, 2,
      [
        ["basic", "10 Foto", 250_000, "Latar putih, 5 produk.", ["10 foto edit penuh", "Resolusi web & cetak"], 3, 1],
        ["standard", "25 Foto", 500_000, "Latar putih + 2 gaya kreatif.", ["25 foto edit penuh", "3 foto lifestyle props"], 5, 2],
        ["premium", "50 Foto + Video", 900_000, "Katalog lengkap.", ["50 foto edit penuh", "2 video produk 15 detik", "Konsultasi visual toko"], 7, 2],
      ]);

    addService("svc-fotomenu", "u-lensa", "foto-video-produk", "Foto Menu Makanan Warung & Kafe", "foto-menu-makanan-warung-kafe",
      "Sesi foto di tempat usahamu saat menu baru matang — uap, tekstur, dan warna asli. Termasuk penataan sederhana dengan properti yang ada di lokasi.", 4, 1,
      [
        ["basic", "8 Menu", 300_000, "Sesi 2 jam di lokasi.", ["16 foto (2 angle per menu)", "Edit warna natural"], 3, 1],
        ["standard", "15 Menu", 600_000, "Sesi setengah hari.", ["30 foto siap GrabFood/GoFood", "5 foto suasana warung"], 4, 1],
      ]);

    addService("svc-webprofile", "u-hafid", "website-uiux", "Website Company Profile", "website-company-profile",
      "Website profil usaha yang cepat, mudah diedit, dan siap muncul di pencarian Google. Termasuk pengaturan domain, email profesional, dan panduan singkat untuk tim internal.", 21, 3,
      [
        ["basic", "Landing 1 Halaman", 1_500_000, "Satu halaman panjang terstruktur.", ["Desain responsif", "Form kontak/WhatsApp", "Setup domain & hosting"], 10, 2],
        ["standard", "5 Halaman", 3_500_000, "Beranda, tentang, layanan, galeri, kontak.", ["CMS mudah diedit", "SEO dasar & Google Business", "Pelatihan 1 sesi"], 21, 3],
        ["premium", "Custom + Blog", 6_500_000, "Kebutuhan khusus & konten.", ["Fitur sesuai kebutuhan", "Blog & artikel awal", "Pendampingan 30 hari"], 30, 3],
      ]);

    addService("svc-landing", "u-hafid", "website-uiux", "Landing Page UMKM Siap Online", "landing-page-umkm-siap-online",
      "Halaman jualan satu tautan untuk katalog, promo, dan tombol WhatsApp — cocok dipasang di bio Instagram. Selesai cepat, ringan dibuka di HP pelanggan.", 7, 2,
      [
        ["basic", "Katalog Sederhana", 750_000, "Sampai 10 produk/layanan.", ["Desain mobile-first", "Tombol WhatsApp langsung"], 5, 2],
        ["standard", "Katalog + Promo", 1_400_000, "Sampai 30 produk + bagian promo.", ["Galeri & testimoni", "Statistik kunjungan dasar"], 7, 2],
      ]);

    addService("svc-maskot", "u-ilustra", "ilustrasi", "Ilustrasi Karakter & Maskot", "ilustrasi-karakter-maskot",
      "Maskot yang bikin brand-mu gampang diingat: eksplorasi karakter, ekspresi, dan pose siap pakai untuk konten. File vektor diserahkan penuh.", 10, 3,
      [
        ["basic", "1 Karakter", 300_000, "1 pose utama.", ["File PNG & vektor", "2x revisi"], 7, 2],
        ["standard", "Maskot + 3 Pose", 650_000, "Karakter utama + variasi.", ["3 pose & 3 ekspresi", "Sticker pack WhatsApp 6 buah"], 10, 3],
        ["premium", "Maskot Lengkap", 1_200_000, "Untuk kebutuhan kampanye.", ["6 pose & panduan karakter", "Adaptasi feed 3 desain"], 14, 3],
      ]);

    addService("svc-aivisual", "u-ilustra", "creative-ai", "Desain Konsep Visual Berbantuan AI", "desain-konsep-visual-berbantuan-ai",
      "Eksplorasi arah visual cepat memakai alat AI, lalu dirapikan manual agar konsisten dan layak pakai komersial. Transparan soal proses — cocok untuk moodboard dan uji konsep.", 5, 2,
      [
        ["basic", "Moodboard Konsep", 200_000, "1 arah visual.", ["12 referensi terkurasi", "Catatan arah gaya"], 3, 1],
        ["standard", "Paket Eksplorasi", 450_000, "3 arah visual berbeda.", ["3 moodboard", "6 visual kunci hasil rapi", "1 sesi diskusi"], 5, 2],
      ]);

    addService("svc-feedig", "u-batikpixel", "desain-grafis", "Desain Feed Instagram 30 Konten", "desain-feed-instagram-30-konten",
      "Sebulan feed rapi dengan template konsisten: promo, edukasi, dan konten interaksi. Kamu tinggal isi caption dari draf yang kami siapkan.", 10, 2,
      [
        ["basic", "15 Konten", 600_000, "Template 3 pilar konten.", ["15 desain feed", "File editable Canva"], 7, 2],
        ["standard", "30 Konten + Story", 1_100_000, "Sebulan penuh.", ["30 desain feed", "10 template story", "Draf caption"], 10, 2],
      ]);

    addService("svc-merch", "u-batikpixel", "percetakan-merchandise", "Cetak Merchandise & Kaos Event", "cetak-merchandise-kaos-event",
      "Desain plus produksi jadi satu: kaos panitia, lanyard, totebag, dan plakat. Harga sudah termasuk desain dan ongkir area Madura.", 10, 1,
      [
        ["basic", "Kaos 12 pcs", 500_000, "Sablon 1 titik, desain termasuk.", ["12 kaos combed 24s", "Desain 2 alternatif"], 7, 1],
        ["standard", "Paket Event 24 pcs", 1_000_000, "Kaos + lanyard panitia.", ["24 kaos + 24 lanyard", "Desain seragam event"], 10, 1],
      ]);

    addService("svc-videopromo", "u-arek", "videografi", "Video Promosi UMKM 60–90 Detik", "video-promosi-umkm-60-90-detik",
      "Video promosi yang menonjolkan proses dan orang di balik usahamu — bukan sekadar produk. Syuting setengah hari di lokasi, naskah disiapkan bersama.", 12, 2,
      [
        ["basic", "Promo Ringkas", 800_000, "Syuting 3 jam, 1 lokasi.", ["Video 60 detik", "Versi 9:16 untuk Reels"], 8, 2],
        ["standard", "Promo + Wawancara", 1_700_000, "Syuting setengah hari.", ["Video 90 detik", "Cuplikan wawancara pemilik", "3 potongan Reels"], 12, 2],
        ["premium", "Cerita Brand", 3_200_000, "2 hari syuting, 2 lokasi.", ["Video 2–3 menit sinematik", "5 potongan Reels", "Foto BTS"], 18, 3],
      ]);

    addService("svc-voiceover", "u-suara", "voice-over-audio", "Voice Over Iklan & Company Profile", "voice-over-iklan-company-profile",
      "Pengisi suara perempuan, jernih dan hangat — tersedia Bahasa Indonesia formal, santai, atau logat Madura halus. Revisi pengucapan cepat, file bersih tanpa noise.", 3, 2,
      [
        ["basic", "Sampai 100 Kata", 150_000, "Cocok untuk iklan pendek.", ["File WAV & MP3", "1x revisi pengucapan"], 2, 1],
        ["standard", "Sampai 300 Kata", 350_000, "Video profil & penjelasan.", ["File bersih siap mixing", "2x revisi"], 3, 2],
        ["premium", "Naskah Panjang + Mixing", 700_000, "Termasuk penyelarasan musik.", ["Mixing dengan backsound", "Sinkron ke video final"], 4, 2],
      ]);

    addService("svc-sosmed", "u-keraton", "social-media", "Kelola Media Sosial Bulanan", "kelola-media-sosial-bulanan",
      "Tim kami memegang akunmu seperti akun sendiri: kalender konten, desain, caption, penjadwalan, dan balasan komentar jam kerja. Laporan tiap akhir bulan dalam bahasa yang mudah dipahami.", 30, 2,
      [
        ["basic", "Paket Hadir", 850_000, "12 posting/bulan, 1 platform.", ["Kalender konten", "Desain & caption", "Laporan bulanan"], 30, 1],
        ["standard", "Paket Tumbuh", 1_600_000, "20 posting + story, 2 platform.", ["Riset tagar & jam tayang", "Balas komentar jam kerja", "Laporan + rekomendasi"], 30, 2],
        ["premium", "Paket Serius", 2_750_000, "Konten harian + 4 Reels.", ["Syuting konten 1x/bulan", "Kolaborasi mikro-influencer lokal", "Rapat evaluasi bulanan"], 30, 2],
      ]);

    addService("svc-brandguide", "u-keraton", "branding-logo", "Strategi Brand & Panduan Visual", "strategi-brand-panduan-visual",
      "Untuk usaha yang logonya sudah ada tapi tampilannya belum konsisten: kami rapikan warna, tipografi, gaya foto, dan suara brand dalam satu dokumen panduan.", 14, 2,
      [
        ["basic", "Audit + Rekomendasi", 950_000, "Tinjauan menyeluruh.", ["Dokumen audit 10+ halaman", "Prioritas perbaikan"], 7, 1],
        ["standard", "Panduan Lengkap", 1_900_000, "Audit + panduan visual.", ["Brand guideline PDF", "Template konten 8 desain", "1 sesi sosialisasi tim"], 14, 2],
      ]);

    addService("svc-keluarga", "u-nara", "fotografi", "Foto Keluarga & Wisuda", "foto-keluarga-wisuda",
      "Sesi santai di studio, rumah, atau lokasi favorit keluargamu. Arahan gaya yang sabar untuk segala usia — dari kakek-nenek sampai balita yang susah diam.", 5, 1,
      [
        ["basic", "Sesi Studio 1 Jam", 350_000, "Sampai 6 orang.", ["25 foto terkurasi", "10 foto edit penuh"], 4, 1],
        ["standard", "Sesi Lokasi 2 Jam", 650_000, "Outdoor atau rumah.", ["50 foto terkurasi", "20 foto edit penuh", "1 cetak 10R + bingkai"], 5, 1],
      ]);

    addService("svc-3dbooth", "u-tiga", "3d-visualisasi", "Visualisasi 3D Booth & Interior", "visualisasi-3d-booth-interior",
      "Lihat booth pameran atau interior usahamu sebelum satu paku pun dipasang. Render realistis dari denah atau sketsa kasar, lengkap dengan alternatif material.", 10, 2,
      [
        ["basic", "1 Render Sudut", 1_200_000, "1 desain, 1 sudut pandang.", ["Render 4K", "2x revisi minor"], 7, 2],
        ["standard", "3 Sudut + Denah", 2_400_000, "Presentasi lebih meyakinkan.", ["3 render 4K", "Denah berukuran", "Daftar material"], 10, 2],
        ["premium", "Paket Tender", 4_000_000, "Untuk pengajuan proposal.", ["5 render + video orbit 15 dtk", "Revisi desain 3x", "File kerja"], 14, 3],
      ]);

    /* ── Portofolio (20) ──────────────────────────────────────── */
    const pf = (id: string, provider: string, title: string, category: string, year: number, seed: number, description = "") =>
      ins("portfolio_items", { id, provider_id: provider, title, description, category_id: cat(category), year, cover_seed: seed, is_active: 1, created_at: iso(60) });

    pf("pf-01", "u-rofiqi", "Resepsi Adat di Pendopo Bangkalan", "fotografi", 2026, 3, "Liputan dua fotografer, 400 foto terkurasi.");
    pf("pf-02", "u-rofiqi", "Lamaran Keluarga H. Zainal", "fotografi", 2025, 7, "Sesi candid suasana rumah, cahaya natural.");
    pf("pf-03", "u-rofiqi", "Dokumentasi Wisuda STKIP", "dokumentasi-acara", 2025, 11, "Liputan resmi + booth foto keluarga.");
    pf("pf-04", "u-karapan", "Rebranding Keripik Singkong 'Renyah'", "branding-logo", 2026, 5, "Logo, kemasan 3 varian, dan template feed.");
    pf("pf-05", "u-karapan", "Identitas Kafe Pelabuhan Kamal", "branding-logo", 2025, 14, "Logo dan menu board bergaya pesisir.");
    pf("pf-06", "u-bagus", "Serial Reels 'Sarapan Madura'", "editing-video", 2026, 2, "12 episode, rata-rata 40 ribu tayangan.");
    pf("pf-07", "u-bagus", "Bumper Animasi Podcast Lokal", "animasi-motion", 2025, 9, "Intro 8 detik, logo bergerak.");
    pf("pf-08", "u-lensa", "Katalog 60 Produk Toko Oleh-oleh", "foto-video-produk", 2026, 6, "Foto latar putih + lifestyle untuk marketplace.");
    pf("pf-09", "u-lensa", "Menu Baru Kafe Tanjung", "foto-video-produk", 2025, 13, "15 menu, gaya natural light.");
    pf("pf-10", "u-hafid", "Website CV Logam Jaya", "website-uiux", 2026, 4, "Company profile 5 halaman + katalog mesin.");
    pf("pf-11", "u-hafid", "Landing Page Travel Umrah", "website-uiux", 2025, 10, "Satu halaman, form pendaftaran WhatsApp.");
    pf("pf-12", "u-ilustra", "Maskot 'Si Cakra' Festival Anak", "ilustrasi", 2026, 8, "Karakter + 6 pose untuk media kampanye.");
    pf("pf-13", "u-ilustra", "Ilustrasi Sampul Buku Cerita", "ilustrasi", 2025, 15, "Gaya cat air digital.");
    pf("pf-14", "u-batikpixel", "Feed Sebulan Toko Batik Podhek", "desain-grafis", 2026, 1, "30 konten dengan motif khas toko.");
    pf("pf-15", "u-batikpixel", "Merchandise Jalan Sehat 1.000 Peserta", "percetakan-merchandise", 2025, 12, "Kaos, nomor dada, dan spanduk.");
    pf("pf-16", "u-arek", "Video Wisata Pantai Sembilan", "videografi", 2026, 3, "Video 2 menit untuk promosi desa wisata.");
    pf("pf-17", "u-suara", "Iklan Radio Toko Emas Mutiara", "voice-over-audio", 2026, 5, "Naskah 30 detik, dua versi bahasa.");
    pf("pf-18", "u-keraton", "Pengelolaan IG Resto Bebek Songkem", "social-media", 2026, 7, "6 bulan, pengikut naik 3x lipat.");
    pf("pf-19", "u-nara", "Sesi Keluarga Besar di Pantai Lombang", "fotografi", 2025, 9, "23 anggota keluarga, matahari terbit.");
    pf("pf-20", "u-tiga", "Render Booth Expo Surabaya 6×6 m", "3d-visualisasi", 2026, 4, "5 render + video orbit untuk tender.");

    /* ── Proyek terbuka & brief langsung ─────────────────────── */
    const addProject = (
      id: string, clientId: string, title: string, category: string, kab: string,
      mode: "remote" | "onsite" | "hybrid", bmin: number, bmax: number,
      description: string, daysAgo: number, deadlineDays: number | null,
      kind: "open" | "direct" = "open", target: string | null = null
    ) =>
      ins("projects", {
        id, client_id: clientId, target_provider_id: target, kind, title, description,
        category_id: cat(category), kabupaten: kab, work_mode: mode,
        budget_min: bmin, budget_max: bmax,
        deadline: deadlineDays ? iso(-deadlineDays).slice(0, 10) : null,
        status: "open", created_at: iso(daysAgo),
      });

    addProject("prj-01", "u-aisyah", "Konten Instagram Ramadan untuk Kopi Losari", "social-media", "Bangkalan", "remote", 750_000, 1_500_000,
      "Kopi Losari mau lebih serius di Instagram menjelang Ramadan: butuh 20 konten feed + 8 story sebulan dengan nuansa hangat khas kedai kopi rumahan. Sudah ada logo dan foto interior; butuh arahan konten, desain, dan draf caption. Nilai plus jika paham selera pasar Bangkalan.", 6, 30);
    addProject("prj-02", "u-aisyah", "Foto 12 menu baru Kopi Losari", "foto-video-produk", "Bangkalan", "onsite", 300_000, 600_000,
      "Kami baru meluncurkan 12 menu (kopi susu varian gula aren, pastry, dan rice bowl). Butuh foto yang bikin lapar untuk GrabFood, GoFood, dan Instagram. Pemotretan di kedai (Jl. area Bangkalan kota), menu dimasak fresh saat sesi.", 4, 21);
    addProject("prj-03", "u-budi", "Video profil perusahaan konstruksi", "videografi", "Sumenep", "hybrid", 2_500_000, 5_000_000,
      "CV Madura Jaya (kontraktor bangunan, 15 tahun berdiri) butuh video profil 2–3 menit untuk tender dan website: cuplikan proyek berjalan, wawancara direktur, dan footage kantor. Dua lokasi proyek di Sumenep, fleksibel jadwal syuting.", 9, 45);
    addProject("prj-04", "u-fitri", "Undangan digital pernikahan tema pesisir", "desain-grafis", "Pamekasan", "remote", 150_000, 400_000,
      "Menikah bulan depan, ingin undangan digital (web/video) bertema pesisir Madura yang elegan — bukan template pasaran. Sudah ada foto prewedding dan daftar acara. Butuh hitung mundur, peta lokasi, dan form RSVP sederhana.", 3, 25);
    addProject("prj-05", "u-mahmud", "Foto katalog 40 artikel batik tulis", "foto-video-produk", "Pamekasan", "onsite", 800_000, 1_500_000,
      "Batik Tresna mau masuk marketplace. Butuh foto 40 artikel batik tulis: flat lay detail motif + foto dipakai model (model dari keluarga, tidak perlu menyediakan). Pemotretan di galeri kami di Pamekasan, kain siap disetrika rapi.", 12, 30);
    addProject("prj-06", "u-budi", "Website company profile CV Madura Jaya", "website-uiux", "Sumenep", "remote", 2_000_000, 6_000_000,
      "Butuh website profil kontraktor: beranda, tentang, layanan, galeri proyek (50+ foto), dan halaman kontak. Harus mudah kami perbarui sendiri dan cepat dibuka di HP. Domain sudah dibeli.", 15, 60);
    addProject("prj-07", "u-mahmud", "Kelola Instagram Batik Tresna 3 bulan", "social-media", "Pamekasan", "hybrid", 900_000, 1_800_000,
      "Akun @batiktresna (demo) sudah setahun jalan tapi tidak konsisten. Butuh pengelolaan 3 bulan: kalender konten, desain, caption yang sopan dan berkelas, serta laporan bulanan. Sesekali perlu datang untuk konten proses membatik.", 8, 40);
    addProject("prj-08", "u-fitri", "Editing 12 video vlog perjalanan Madura", "editing-video", "Pamekasan", "remote", 400_000, 900_000,
      "Punya footage perjalanan keliling Madura (4 kabupaten) dari HP dan action cam. Butuh editor untuk 12 episode vlog 5–8 menit: cutting, koreksi warna ringan, subtitle, dan musik bebas hak cipta. Gaya santai seperti vlog harian.", 5, 35);
    addProject("prj-09", "u-budi", "Maskot event Karapan Sapi Expo", "ilustrasi", "Sumenep", "remote", 500_000, 1_200_000,
      "Kami sponsor expo UMKM bertema karapan sapi. Butuh maskot sapi yang ramah dan modern (bukan kartun anak-anak) + 4 pose untuk spanduk, feed, dan photobooth. File vektor wajib diserahkan.", 7, 28);
    addProject("prj-10", "u-mahmud", "Desain kemasan gift box batik premium", "desain-grafis", "Pamekasan", "remote", 400_000, 900_000,
      "Menyambut musim haji dan oleh-oleh, kami siapkan gift box batik premium. Butuh desain box, kartu ucapan, dan segel — kesan mewah tapi tetap membumi. Ukuran box sudah fix, tinggal desain.", 10, 30);
    addProject("prj-11", "u-fitri", "Voice over untuk video undangan", "voice-over-audio", "Pamekasan", "remote", 100_000, 250_000,
      "Melengkapi undangan video pernikahan: butuh voice over perempuan ±120 kata, nada hangat dan khidmat, Bahasa Indonesia dengan sapaan pembuka Bahasa Madura halus. Naskah sudah siap.", 2, 20);
    addProject("prj-12", "u-budi", "Visualisasi 3D booth pameran di Surabaya", "3d-visualisasi", "Sumenep", "hybrid", 1_500_000, 3_000_000,
      "Ikut pameran konstruksi di Surabaya, dapat lahan 4×6 m. Butuh desain + render 3D booth yang menonjolkan portofolio proyek, area konsultasi, dan gudang kecil. Output untuk approval vendor booth.", 11, 50);
    addProject("prj-13", "u-fitri", "Prewedding di Pantai Lombang", "fotografi", "Sumenep", "onsite", 0, 2_000_000,
      "Halo Kak Rofiqi, saya lihat portofolio wedding-nya bagus sekali. Kami rencana prewedding di Pantai Lombang saat matahari terbit, konsep kasual dengan sentuhan kain batik keluarga. Kira-kira paket dan tanggalnya bagaimana ya?", 1, 30, "direct", "u-rofiqi");

    /* ── Proposal ─────────────────────────────────────────────── */
    const addProposal = (id: string, projectId: string, providerId: string, clientId: string, price: number, days: number, message: string, daysAgo: number, status = "sent") =>
      ins("proposals", { id, project_id: projectId, provider_id: providerId, client_id: clientId, message, price, estimated_days: days, status, created_at: iso(daysAgo) });

    addProposal("prop-01", "prj-01", "u-keraton", "u-aisyah", 1_400_000, 30,
      "Halo Kak Aisyah! Kami mengelola beberapa akun kedai makanan di Madura. Untuk Ramadan, kami usulkan 3 pilar konten: menu andalan berbuka, cerita di balik Kopi Losari, dan konten interaksi (kuis takjil). Termasuk 20 feed + 8 story, kalender disetujui dulu sebelum produksi, dan laporan akhir bulan. Contoh pengelolaan bisa dilihat di portofolio kami.", 5);
    addProposal("prop-02", "prj-01", "u-ilustra", "u-aisyah", 1_100_000, 28,
      "Halo Kak, saya ilustrator — penawaran saya sedikit berbeda: feed Ramadan Kopi Losari dengan ilustrasi khas (bukan foto template), jadi tampil beda dari kedai lain. 20 konten ilustrasi + 8 story, gaya hangat seperti buku cerita. Draf caption saya bantu juga.", 4);
    addProposal("prop-03", "prj-02", "u-lensa", "u-aisyah", 450_000, 4,
      "Halo Kak Aisyah, saya spesialis foto menu — pernah memotret 15 menu Kafe Tanjung (ada di portofolio). Usulan: sesi 3 jam di kedai saat menu fresh, 12 menu × 2 angle + 5 foto suasana. Hasil H+2 sudah siap unggah ke GrabFood/GoFood.", 3);
    addProposal("prop-04", "prj-03", "u-rofiqi", "u-budi", 4_200_000, 18,
      "Selamat siang Pak Budi. Saya biasa menangani dokumentasi formal dan video profil. Usulan alur: 1 hari syuting di 2 lokasi proyek + kantor, wawancara direktur dengan pertanyaan yang saya siapkan, hasil video 2,5 menit + 3 potongan pendek untuk media sosial. Termasuk drone untuk footage proyek (izin lokasi saya urus).", 7);

    /* ── Percakapan, order, milestone, delivery, review ───────── */
    const conv = (id: string, orderId: string | null, members: string[], createdDaysAgo: number) => {
      ins("conversations", { id, order_id: orderId, project_id: null, created_at: iso(createdDaysAgo) });
      members.forEach((m) => ins("conversation_members", { conversation_id: id, user_id: m, last_read_at: iso(createdDaysAgo) }));
    };
    const msg = (id: string, convId: string, sender: string, body: string, daysAgo: number, hour = 0) =>
      ins("messages", { id, conversation_id: convId, sender_id: sender, body, created_at: iso(daysAgo, hour) });

    const addOrder = (
      id: string, clientId: string, providerId: string, title: string, price: number, days: number,
      status: string, createdDaysAgo: number,
      opts: { serviceId?: string; packageId?: string; proposalId?: string; projectId?: string } = {}
    ) => {
      const convId = `conv-${id}`;
      conv(convId, id, [clientId, providerId], createdDaysAgo);
      ins("orders", {
        id, client_id: clientId, provider_id: providerId,
        service_id: opts.serviceId ?? null, package_id: opts.packageId ?? null,
        proposal_id: opts.proposalId ?? null, project_id: opts.projectId ?? null,
        conversation_id: convId, title, agreed_price: price, agreed_days: days,
        status, payment_status: "direct_agreement",
        created_at: iso(createdDaysAgo), updated_at: iso(Math.max(0, createdDaysAgo - 2)),
      });
      ins("order_activities", { id: `act-${id}-0`, order_id: id, actor_id: clientId, type: "created", message: "Pesanan dibuat.", created_at: iso(createdDaysAgo) });
    };

    // A — pesanan aktif milik akun demo (klien Aisyah × talenta Rofiqi)
    addOrder("ord-a", "u-aisyah", "u-rofiqi", "Dokumentasi Grand Opening Kopi Losari", 1_800_000, 7, "active", 8, {
      serviceId: "svc-dokumentasi", packageId: "svc-dokumentasi-standard",
    });
    ins("order_activities", { id: "act-a-1", order_id: "ord-a", actor_id: "u-rofiqi", type: "status", message: "Pesanan diterima penyedia.", created_at: iso(7) });
    ins("order_activities", { id: "act-a-2", order_id: "ord-a", actor_id: "u-rofiqi", type: "status", message: "Pengerjaan dimulai.", created_at: iso(6) });
    ins("order_milestones", { id: "ms-a-1", order_id: "ord-a", title: "Survey lokasi & shotlist", due_date: iso(5).slice(0, 10), status: "done", sort_order: 1, created_at: iso(7) });
    ins("order_milestones", { id: "ms-a-2", order_id: "ord-a", title: "Liputan hari-H (2 fotografer)", due_date: iso(-2).slice(0, 10), status: "in_progress", sort_order: 2, created_at: iso(7) });
    ins("order_milestones", { id: "ms-a-3", order_id: "ord-a", title: "Kurasi & edit 60 foto", due_date: iso(-5).slice(0, 10), status: "pending", sort_order: 3, created_at: iso(7) });
    msg("m-a-1", "conv-ord-a", "u-aisyah", "Halo Kak Rofiqi, grand opening kami hari Sabtu jam 8 pagi. Acara inti: potong tumpeng, sambutan, dan sesi foto pelanggan pertama.", 8, 1);
    msg("m-a-2", "conv-ord-a", "u-rofiqi", "Siap Kak Aisyah! Saya datang jam 7 untuk ambil suasana persiapan. Boleh minta rundown tertulisnya biar tidak ada momen terlewat?", 8, 2);
    msg("m-a-3", "conv-ord-a", "u-aisyah", "Sudah saya kirim ke email ya Kak. Oh iya, tolong perbanyak foto interaksi barista dengan pelanggan.", 7, 1);
    msg("m-a-4", "conv-ord-a", "u-rofiqi", "Noted! Survey lokasi kemarin sudah beres, pencahayaan dalam kedai bagus. Sampai jumpa Sabtu 🙌", 6, 3);

    // C — hasil sudah dikirim, menunggu persetujuan klien demo (Aisyah × Hafid)
    addOrder("ord-c", "u-aisyah", "u-hafid", "Landing page katalog Kopi Losari", 1_400_000, 7, "submitted", 12, {
      serviceId: "svc-landing", packageId: "svc-landing-standard",
    });
    ins("order_milestones", { id: "ms-c-1", order_id: "ord-c", title: "Struktur halaman & copywriting", due_date: null, status: "done", sort_order: 1, created_at: iso(11) });
    ins("order_milestones", { id: "ms-c-2", order_id: "ord-c", title: "Desain & development", due_date: null, status: "done", sort_order: 2, created_at: iso(11) });
    ins("deliveries", { id: "del-c-1", order_id: "ord-c", note: "Halo Kak Aisyah, landing page sudah tayang di tautan staging (saya kirim di chat). Sudah termasuk katalog 10 menu, tombol WhatsApp, dan peta kedai. Silakan dicek di HP juga — kalau ada penyesuaian warna atau teks, tinggal minta revisi ya.", file_name: null, file_path: null, mime: null, size: null, created_at: iso(2) });
    ins("order_activities", { id: "act-c-1", order_id: "ord-c", actor_id: "u-hafid", type: "delivery", message: "Hasil pekerjaan dikirim.", created_at: iso(2) });
    msg("m-c-1", "conv-ord-c", "u-hafid", "Kak Aisyah, tautan staging: losari-demo.pages.dev (contoh). Ditunggu masukannya ya.", 2, 1);
    msg("m-c-2", "conv-ord-c", "u-aisyah", "Wah cepat! Saya cek dulu malam ini ya Kak.", 2, 4);

    // F — permintaan masuk baru untuk talenta demo (Budi × Rofiqi)
    addOrder("ord-f", "u-budi", "u-rofiqi", "Dokumentasi serah terima proyek gudang", 900_000, 5, "inquiry", 1, {
      serviceId: "svc-dokumentasi", packageId: "svc-dokumentasi-basic",
    });
    msg("m-f-1", "conv-ord-f", "u-budi", "Pak Rofiqi, kami ada acara serah terima proyek gudang minggu depan di Sumenep, sekitar 3 jam. Apakah tanggal 3 tersedia?", 1, 1);

    // B — selesai + ulasan (Aisyah × Batik Pixel)
    addOrder("ord-b", "u-aisyah", "u-batikpixel", "Desain logo & kemasan Kopi Losari", 950_000, 10, "completed", 45, {
      serviceId: "svc-logo",
    });
    ins("deliveries", { id: "del-b-1", order_id: "ord-b", note: "Final file logo (PNG, SVG, PDF) + kemasan 2 varian sudah dikirim lengkap dengan panduan warna. Terima kasih sudah sabar selama proses revisi, Kak!", file_name: null, file_path: null, mime: null, size: null, created_at: iso(36) });
    ins("order_activities", { id: "act-b-1", order_id: "ord-b", actor_id: "u-aisyah", type: "status", message: "Pesanan diselesaikan klien.", created_at: iso(35) });
    ins("reviews", { id: "rev-b", order_id: "ord-b", client_id: "u-aisyah", provider_id: "u-batikpixel", rating: 5, comment: "Prosesnya enak diajak diskusi, revisi cepat, dan hasil logonya bikin kedai kami kelihatan lebih 'mahal'. File lengkap dan rapi.", is_demo: 1, created_at: iso(35) });

    // D — selesai + ulasan (Fitri × Nara Foto)
    addOrder("ord-d", "u-fitri", "u-nara", "Sesi foto wisuda keluarga", 650_000, 5, "completed", 60);
    ins("deliveries", { id: "del-d-1", order_id: "ord-d", note: "50 foto terkurasi + 20 edit penuh sudah di galeri online, cetakan 10R menyusul H+3.", file_name: null, file_path: null, mime: null, size: null, created_at: iso(55) });
    ins("reviews", { id: "rev-d", order_id: "ord-d", client_id: "u-fitri", provider_id: "u-nara", rating: 5, comment: "Kak Intan sabar banget mengarahkan gaya, apalagi ke orang tua saya yang kaku di depan kamera. Hasilnya natural semua!", is_demo: 1, created_at: iso(54) });

    // Order latar untuk mengisi rating penyedia lain (semua completed + ulasan demo)
    const bg: [string, string, string, string, number, number, number, string][] = [
      ["ord-g1", "u-mahmud", "u-lensa", "Foto katalog 20 kain batik", 500_000, 5, 70, "Detail motif batiknya keluar semua, pembeli online jadi percaya. Recommended!"],
      ["ord-g2", "u-budi", "u-karapan", "Logo divisi baru CV Madura Jaya", 950_000, 10, 85, "Riset kompetitornya serius, presentasi konsep jelas. Logo langsung disetujui direksi."],
      ["ord-g3", "u-fitri", "u-bagus", "Edit 5 video Reels jualan", 300_000, 4, 40, "Editan kekinian dan cepat, cuma subtitle sempat typo sekali — langsung dibenerin sih."],
      ["ord-g4", "u-mahmud", "u-batikpixel", "Spanduk & feed promo Lebaran", 600_000, 7, 95, "Langganan dari dulu, desain selalu pas selera pasar Pamekasan."],
      ["ord-g5", "u-budi", "u-keraton", "Kelola IG perusahaan 1 bulan (uji coba)", 1_600_000, 30, 75, "Laporan bulanannya jelas, engagement naik. Lanjut ke bulan berikutnya."],
      ["ord-g6", "u-fitri", "u-suara", "Voice over video ulang tahun ibu", 150_000, 2, 50, "Suaranya hangat, pengucapan nama keluarga semua benar. Ibu saya sampai nangis."],
      ["ord-g7", "u-budi", "u-tiga", "Render ruang meeting kantor", 1_200_000, 7, 65, "Render bagus dan realistis, meski revisi kedua agak lama karena antrean."],
      ["ord-g8", "u-mahmud", "u-arek", "Video proses membatik 90 detik", 1_700_000, 12, 80, "Videonya berhasil menangkap sisi 'tangan manusia' di balik batik kami. Banyak yang share."],
      ["ord-g9", "u-fitri", "u-ilustra", "Ilustrasi kado pernikahan sahabat", 300_000, 7, 55, "Gambarnya mirip dan penuh detail kecil yang personal. Sahabat saya terharu."],
      ["ord-g10", "u-budi", "u-hafid", "Perbaikan kecepatan website lama", 750_000, 5, 62, "Website jadi jauh lebih cepat dibuka, dijelaskan juga apa saja yang diubah."],
      ["ord-g11", "u-mahmud", "u-rofiqi", "Dokumentasi pengajian akbar toko", 1_800_000, 7, 90, "Momen tamu penting tidak ada yang terlewat, hasil dikirim tepat waktu."],
      ["ord-g12", "u-budi", "u-rofiqi", "Foto tim & kantor untuk profil", 900_000, 5, 58, "Profesional dan efisien, satu sesi selesai semua kebutuhan foto kantor."],
    ];
    for (const [id, cId, pId, title, price, days, ago, comment] of bg) {
      addOrder(id, cId, pId, title, price, days, "completed", ago);
      ins("reviews", { id: `rev-${id}`, order_id: id, client_id: cId, provider_id: pId, rating: comment.includes("agak lama") || comment.includes("typo") ? 4 : 5, comment, is_demo: 1, created_at: iso(ago - 4) });
    }

    /* ── Favorit, notifikasi, verifikasi, laporan ─────────────── */
    ["u-rofiqi", "u-batikpixel", "u-keraton"].forEach((p, i) =>
      ins("favorites", { id: `fav-${i}`, client_id: "u-aisyah", provider_id: p, created_at: iso(20 - i) })
    );

    const notif = (id: string, userId: string, type: string, title: string, body: string, link: string, daysAgo: number, read = 0) =>
      ins("notifications", { id, user_id: userId, type, title, body, link, is_read: read, created_at: iso(daysAgo) });

    notif("ntf-1", "u-aisyah", "proposal", "Proposal baru untuk proyekmu", "Keraton Kreatif mengirim penawaran untuk 'Konten Instagram Ramadan'.", "/dashboard/proyek/prj-01", 5);
    notif("ntf-2", "u-aisyah", "delivery", "Hasil pekerjaan dikirim", "Hafid Ramadhan mengirim hasil untuk 'Landing page katalog Kopi Losari'.", "/pesanan/ord-c", 2);
    notif("ntf-3", "u-rofiqi", "brief", "Brief langsung masuk", "Fitri Handayani mengirim brief 'Prewedding di Pantai Lombang'.", "/dashboard/brief", 1);
    notif("ntf-4", "u-rofiqi", "order", "Permintaan pesanan baru", "Budi Santoso memesan 'Dokumentasi Acara & Seremoni'.", "/pesanan/ord-f", 1);
    notif("ntf-5", "u-admin", "verification", "Permintaan verifikasi menunggu", "2 penyedia menunggu peninjauan verifikasi.", "/admin/verifikasi", 3);

    const verif = (id: string, providerId: string, status: string, daysAgo: number, note: string) =>
      ins("verification_requests", {
        id, provider_id: providerId, note, status,
        created_at: iso(daysAgo), decided_at: status === "pending" ? null : iso(daysAgo - 2),
      });
    verif("vr-1", "u-rofiqi", "approved", 100, "Portofolio dan identitas usaha lengkap.");
    verif("vr-2", "u-karapan", "approved", 95, "Studio terdaftar, portofolio klien nyata.");
    verif("vr-3", "u-lensa", "approved", 90, "Sampel pekerjaan dan testimoni memadai.");
    verif("vr-4", "u-batikpixel", "approved", 88, "Riwayat transaksi dan portofolio baik.");
    verif("vr-5", "u-keraton", "approved", 85, "Legalitas usaha dan tim terverifikasi.");
    verif("vr-6", "u-arek", "pending", 6, "Mengajukan verifikasi: portofolio video wisata dan UMKM terlampir di profil.");
    verif("vr-7", "u-ilustra", "pending", 4, "Mengajukan verifikasi: maskot festival dan sampul buku sebagai bukti karya.");

    ins("reports", {
      id: "rp-1", reporter_id: "u-mahmud", target_type: "service", target_id: "svc-aivisual",
      reason: "Mohon dicek: beberapa gambar contoh di layanan ini sepertinya mirip karya studio lain. Kalau memang orisinal, abaikan laporan saya.",
      status: "open", created_at: iso(3),
    });
  });

  seedAll();
}
