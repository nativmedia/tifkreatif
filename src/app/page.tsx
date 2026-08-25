import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ButtonLink, Card, DemoBadge, Rating } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { PortfolioCover } from "@/components/covers";
import { ProjectListCard, ProviderCard, ServiceCard } from "@/components/cards";
import { featuredProviders, listCategories, listServices, seedFromString } from "@/lib/repos/catalog";
import { listOpenProjects } from "@/lib/repos/projects";
import { platformStats } from "@/lib/repos/admin";
import { getDb } from "@/lib/db";
import { KABUPATEN } from "@/lib/constants";
import type { Review } from "@/lib/types";

export default function HomePage() {
  const categories = listCategories().slice(0, 8);
  const providers = featuredProviders(4);
  const services = listServices({ limit: 4 });
  const projects = listOpenProjects({ perPage: 3 }).items;
  const stats = platformStats();
  const quotes = getDb()
    .prepare(
      `SELECT r.*, p.full_name AS client_name, p.avatar_hue AS client_hue, o.title AS order_title
         FROM reviews r JOIN profiles p ON p.user_id = r.client_id JOIN orders o ON o.id = r.order_id
        WHERE r.rating = 5 ORDER BY LENGTH(r.comment) DESC LIMIT 3`
    )
    .all() as Review[];
  const heroCovers = [
    { seed: seedFromString("hero-wedding"), label: "Dokumentasi wedding" },
    { seed: seedFromString("hero-brand"), label: "Branding UMKM" },
    { seed: seedFromString("hero-video"), label: "Video promosi" },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-bone">
        <div className="dot-field">
          <div className="container-tif grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="eyebrow text-gold">Marketplace Kreatif Pulau Madura</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                Temukan Talenta <span className="text-gold">Kreatif</span> Madura<span className="text-red">.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-bone/75 sm:text-lg">
                Fotografer, desainer, videografer, sampai kreator AI — dari Bangkalan hingga Sumenep. Cari,
                sepakati, kerjakan, dan selesaikan proyek di satu tempat.
              </p>

              <form action="/talenta" className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-[var(--shadow-lift)] sm:flex-row">
                <label htmlFor="hero-q" className="sr-only">
                  Cari talenta atau keahlian
                </label>
                <div className="flex flex-1 items-center gap-2 px-2">
                  <Search size={18} className="shrink-0 text-navy-mist" aria-hidden="true" />
                  <input
                    id="hero-q"
                    name="q"
                    placeholder="Coba: fotografer wedding, logo, video promosi…"
                    className="h-11 w-full bg-transparent text-navy outline-none placeholder:text-navy-mist/70"
                  />
                </div>
                <label htmlFor="hero-kab" className="sr-only">
                  Pilih kabupaten
                </label>
                <select
                  id="hero-kab"
                  name="kabupaten"
                  className="h-11 rounded-xl border border-sand-line bg-bone px-3 text-sm font-semibold text-navy"
                  defaultValue=""
                >
                  <option value="">Semua Madura</option>
                  {KABUPATEN.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
                <button className="h-11 rounded-xl bg-red px-5 font-bold text-white transition-colors hover:bg-red-deep">
                  Cari
                </button>
              </form>

              <p className="mt-5 text-sm text-bone/60">
                <span className="font-bold text-bone">{stats.providers} talenta</span> ·{" "}
                <span className="font-bold text-bone">{stats.services} layanan</span> ·{" "}
                <span className="font-bold text-bone">{stats.completed} proyek selesai</span>
                <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-xs">data demo</span>
              </p>
            </div>

            <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
              {heroCovers.map((c, i) => (
                <div
                  key={i}
                  className="absolute w-60 overflow-hidden rounded-2xl border-4 border-white/10 shadow-[var(--shadow-lift)]"
                  style={{
                    top: `${i * 92}px`,
                    right: `${(2 - i) * 84}px`,
                    transform: `rotate(${i === 1 ? 2.5 : -2}deg)`,
                    aspectRatio: "4/3",
                  }}
                >
                  <PortfolioCover seed={c.seed} label={c.label} />
                  <p className="absolute bottom-0 w-full bg-navy/70 px-3 py-1.5 text-xs font-semibold text-bone backdrop-blur">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="batik-strip h-1.5" />
      </section>

      {/* ── Kategori ─────────────────────────────────────────── */}
      <section className="container-tif py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Kategori</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              Butuh jasa apa hari ini?
            </h2>
          </div>
          <Link href="/talenta" className="link-quiet hidden text-sm font-semibold sm:block">
            Lihat semua talenta
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/talenta?kategori=${c.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-sand-line bg-white p-4 transition-colors hover:border-red"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand text-navy transition-colors group-hover:bg-red-tint group-hover:text-red">
                <CategoryIcon icon={c.icon} />
              </span>
              <span className="text-sm font-bold text-navy">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Talenta pilihan ──────────────────────────────────── */}
      <section className="bg-sand/50 py-14">
        <div className="container-tif">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Talenta Pilihan</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                Dipercaya klien di seluruh Madura
              </h2>
            </div>
            <ButtonLink href="/talenta" variant="outline" size="sm" className="shrink-0">
              Semua talenta <ArrowRight size={15} aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((p) => (
              <ProviderCard key={p.user_id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Layanan unggulan ─────────────────────────────────── */}
      <section className="container-tif py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Layanan Siap Pesan</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              Paket jelas, harga terbuka
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* ── Cara kerja ───────────────────────────────────────── */}
      <section className="bg-navy py-14 text-bone">
        <div className="container-tif">
          <p className="eyebrow text-gold">Cara Kerja</p>
          <h2 className="mt-1 max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">
            Dari cari sampai selesai, semuanya tercatat
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Cari & bandingkan", "Saring talenta berdasarkan kategori, kabupaten, harga, dan ulasan. Lihat portofolio dan paketnya."],
              ["Sepakati di satu ruang", "Kirim brief atau pesan paket. Diskusi, penawaran, dan kesepakatan tersimpan rapi di ruang proyek."],
              ["Terima hasil & ulas", "Pantau progres, minta revisi sesuai paket, setujui hasil, lalu bantu talenta dengan ulasan jujur."],
            ].map(([title, desc], i) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-extrabold text-gold">{i + 1}</p>
                <p className="mt-2 font-bold">{title}</p>
                <p className="mt-1 text-sm text-bone/70">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href="/cara-kerja" variant="gold" size="sm">
              Selengkapnya tentang alurnya
            </ButtonLink>
            <p className="text-sm text-bone/60">
              Pembayaran di MVP ini disepakati langsung antara klien & talenta — jujur, tanpa ilusi.
            </p>
          </div>
        </div>
      </section>

      {/* ── Proyek terbuka ───────────────────────────────────── */}
      <section className="container-tif py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Untuk Talenta</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              Proyek terbuka terbaru
            </h2>
          </div>
          <ButtonLink href="/proyek" variant="outline" size="sm" className="shrink-0">
            Semua proyek <ArrowRight size={15} aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="mt-6 space-y-4">
          {projects.map((p) => (
            <ProjectListCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* ── Ulasan ───────────────────────────────────────────── */}
      <section className="bg-sand/50 py-14">
        <div className="container-tif">
          <p className="eyebrow">Kata Mereka</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Ulasan dari ruang proyek
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quotes.map((r) => (
              <Card key={r.id} className="flex flex-col p-5">
                <Rating value={r.rating} showEmpty={false} />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft">“{r.comment}”</p>
                <div className="mt-4 flex items-center gap-2 border-t border-sand-line pt-3">
                  <p className="text-sm font-bold text-navy">{r.client_name}</p>
                  <DemoBadge />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA talenta ──────────────────────────────────────── */}
      <section className="container-tif py-14">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-bone sm:px-10">
          <div aria-hidden="true" className="batik-strip absolute inset-y-0 left-0 w-1.5" />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Punya keahlian kreatif? Saatnya dikenal se-Madura.
              </h2>
              <p className="mt-2 text-bone/70">
                Buka layananmu gratis, terima brief langsung, dan bangun reputasi lewat ulasan klien.
              </p>
            </div>
            <ButtonLink href="/daftar?peran=provider" variant="gold" size="lg" className="shrink-0">
              Gabung sebagai talenta
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="container-tif pb-16">
        <p className="eyebrow">Tanya Jawab</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Sering ditanyakan</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            ["Apakah memakai TIFKREATIF berbayar?", "Mendaftar, mencari talenta, memasang proyek, dan membuka layanan semuanya gratis di versi MVP ini."],
            ["Bagaimana pembayarannya?", "Untuk saat ini pembayaran disepakati langsung antara klien dan talenta (transfer/tunai sesuai kesepakatan). Sistem pembayaran terlindungi sedang kami siapkan untuk fase berikutnya."],
            ["Apa arti lencana Terverifikasi?", "Talenta terverifikasi telah ditinjau tim kami: bukti karya dan identitas usahanya cocok. Verifikasi bisa diajukan gratis dari dashboard talenta."],
            ["Bagaimana kalau hasil tidak sesuai?", "Gunakan tombol Minta Revisi di ruang proyek sesuai jatah revisi paket. Semua permintaan tercatat sehingga dua pihak sama-sama terlindungi."],
          ].map(([q, a]) => (
            <details key={q} className="group rounded-xl border border-sand-line bg-white p-4 open:shadow-[var(--shadow-card)]">
              <summary className="cursor-pointer list-none font-bold text-navy [&::-webkit-details-marker]:hidden">
                {q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-navy-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
