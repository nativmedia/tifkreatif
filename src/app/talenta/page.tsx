import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { Pagination, ProviderCard } from "@/components/cards";
import { Button, EmptyState } from "@/components/ui";
import { listCategories, listProviders } from "@/lib/repos/catalog";
import { KABUPATEN } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cari Talenta",
  description:
    "Jelajahi fotografer, desainer, videografer, dan talenta kreatif lain dari Bangkalan, Sampang, Pamekasan, dan Sumenep.",
};

const PER_PAGE = 12;

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function TalentaPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = first(sp.q);
  const kategori = first(sp.kategori);
  const kabupaten = first(sp.kabupaten);
  const harga = Number(first(sp.harga)) || 0;
  const rating = Number(first(sp.rating)) || 0;
  const verified = first(sp.terverifikasi) === "1";
  const available = first(sp.tersedia) === "1";
  const sort = (first(sp.urut) || "relevan") as "relevan" | "rating" | "harga" | "terbaru";
  const page = Math.max(1, Number(first(sp.hal)) || 1);

  const categories = listCategories();
  const { items, total } = listProviders({
    q: q || undefined,
    category: kategori || undefined,
    kabupaten: kabupaten || undefined,
    priceMax: harga || undefined,
    ratingMin: rating || undefined,
    verified,
    available,
    sort,
    page,
    perPage: PER_PAGE,
  });

  const makeHref = (n: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, kategori, kabupaten, urut: sort })) if (v) params.set(k, v);
    if (harga) params.set("harga", String(harga));
    if (rating) params.set("rating", String(rating));
    if (verified) params.set("terverifikasi", "1");
    if (available) params.set("tersedia", "1");
    if (n > 1) params.set("hal", String(n));
    const s = params.toString();
    return `/talenta${s ? `?${s}` : ""}`;
  };

  const filterForm = (
    <form className="space-y-4" aria-label="Filter talenta">
      {q && <input type="hidden" name="q" value={q} />}
      <div>
        <label htmlFor="f-kategori" className="mb-1.5 block text-sm font-semibold text-navy">
          Kategori
        </label>
        <select id="f-kategori" name="kategori" defaultValue={kategori} className="h-10 w-full rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-kab" className="mb-1.5 block text-sm font-semibold text-navy">
          Kabupaten
        </label>
        <select id="f-kab" name="kabupaten" defaultValue={kabupaten} className="h-10 w-full rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Seluruh Madura</option>
          {KABUPATEN.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-harga" className="mb-1.5 block text-sm font-semibold text-navy">
          Harga mulai maksimal
        </label>
        <select id="f-harga" name="harga" defaultValue={harga || ""} className="h-10 w-full rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Berapa pun</option>
          <option value="300000">≤ Rp300 rb</option>
          <option value="750000">≤ Rp750 rb</option>
          <option value="1500000">≤ Rp1,5 jt</option>
          <option value="3000000">≤ Rp3 jt</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-rating" className="mb-1.5 block text-sm font-semibold text-navy">
          Rating minimal
        </label>
        <select id="f-rating" name="rating" defaultValue={rating || ""} className="h-10 w-full rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Semua rating</option>
          <option value="4">4.0 ke atas</option>
          <option value="4.5">4.5 ke atas</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name="terverifikasi" value="1" defaultChecked={verified} className="accent-red" />
        Hanya terverifikasi
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name="tersedia" value="1" defaultChecked={available} className="accent-red" />
        Sedang tersedia
      </label>
      <input type="hidden" name="urut" value={sort} />
      <Button type="submit" className="w-full" variant="secondary" size="sm">
        Terapkan filter
      </Button>
    </form>
  );

  return (
    <div className="container-tif py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Cari Talenta</h1>
          <p className="mt-1 text-sm text-navy-mist">
            {total} talenta{q && ` untuk “${q}”`}
            {kabupaten && ` di ${kabupaten}`} — data demo diberi label.
          </p>
        </div>
        <form aria-label="Urutkan hasil">
          {Object.entries({ q, kategori, kabupaten }).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
          {harga ? <input type="hidden" name="harga" value={harga} /> : null}
          {rating ? <input type="hidden" name="rating" value={rating} /> : null}
          {verified && <input type="hidden" name="terverifikasi" value="1" />}
          {available && <input type="hidden" name="tersedia" value="1" />}
          <label htmlFor="urut" className="mr-2 text-sm font-semibold text-navy-soft">
            Urutkan
          </label>
          <select
            id="urut"
            name="urut"
            defaultValue={sort}
            className="h-9 rounded-lg border border-sand-line bg-white px-2 text-sm"
          >
            <option value="relevan">Paling relevan</option>
            <option value="rating">Rating tertinggi</option>
            <option value="harga">Harga terendah</option>
            <option value="terbaru">Terbaru bergabung</option>
          </select>
          <Button type="submit" variant="outline" size="sm" className="ml-2">
            Urutkan
          </Button>
        </form>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-sand-line bg-white p-4">{filterForm}</div>
        </aside>

        <details className="rounded-xl border border-sand-line bg-white p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-navy [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal size={16} aria-hidden="true" /> Filter
          </summary>
          <div className="mt-4">{filterForm}</div>
        </details>

        <div className="lg:col-start-2">
          {items.length === 0 ? (
            <EmptyState
              title="Belum ada talenta yang cocok dengan filter ini"
              hint="Coba longgarkan filter — misalnya pilih Seluruh Madura atau hapus batas harga."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <ProviderCard key={p.user_id} p={p} />
              ))}
            </div>
          )}
          <Pagination page={page} total={total} perPage={PER_PAGE} makeHref={makeHref} />
        </div>
      </div>
    </div>
  );
}
