import type { Metadata } from "next";
import { Pagination, ProjectListCard } from "@/components/cards";
import { Button, ButtonLink, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { listCategories } from "@/lib/repos/catalog";
import { listOpenProjects } from "@/lib/repos/projects";
import { KABUPATEN } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Proyek Terbuka",
  description: "Peluang kerja kreatif dari klien di seluruh Madura — kirim proposalmu.",
};

const PER_PAGE = 8;
type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProyekPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = first(sp.q);
  const kategori = first(sp.kategori);
  const kabupaten = first(sp.kabupaten);
  const page = Math.max(1, Number(first(sp.hal)) || 1);

  const user = await getSessionUser();
  const categories = listCategories();
  const { items, total } = listOpenProjects({
    q: q || undefined,
    category: kategori || undefined,
    kabupaten: kabupaten || undefined,
    page,
    perPage: PER_PAGE,
  });

  const makeHref = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (kategori) p.set("kategori", kategori);
    if (kabupaten) p.set("kabupaten", kabupaten);
    if (n > 1) p.set("hal", String(n));
    const s = p.toString();
    return `/proyek${s ? `?${s}` : ""}`;
  };

  return (
    <div className="container-tif py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Proyek Terbuka</h1>
          <p className="mt-1 text-sm text-navy-mist">
            {total} peluang menunggu proposal terbaikmu.
          </p>
        </div>
        {user?.role === "client" ? (
          <ButtonLink href="/dashboard/proyek/baru" size="sm">
            Pasang proyek baru
          </ButtonLink>
        ) : !user ? (
          <ButtonLink href="/daftar" variant="outline" size="sm">
            Daftar untuk memasang proyek
          </ButtonLink>
        ) : null}
      </header>

      <form className="mt-5 grid gap-2 rounded-xl border border-sand-line bg-white p-3 sm:grid-cols-[1fr_180px_180px_auto]" aria-label="Filter proyek">
        <label htmlFor="pq" className="sr-only">
          Kata kunci
        </label>
        <input
          id="pq"
          name="q"
          defaultValue={q}
          placeholder="Cari proyek… (mis. foto, website, batik)"
          className="h-10 rounded-lg border border-sand-line bg-white px-3 text-sm"
        />
        <label htmlFor="pkat" className="sr-only">
          Kategori
        </label>
        <select id="pkat" name="kategori" defaultValue={kategori} className="h-10 rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="pkab" className="sr-only">
          Kabupaten
        </label>
        <select id="pkab" name="kabupaten" defaultValue={kabupaten} className="h-10 rounded-lg border border-sand-line bg-white px-3 text-sm">
          <option value="">Seluruh Madura</option>
          {KABUPATEN.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="md">
          Cari
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            title="Tidak ada proyek yang cocok"
            hint="Coba kata kunci lain atau pantau lagi nanti — proyek baru masuk setiap saat."
          />
        ) : (
          items.map((p) => <ProjectListCard key={p.id} p={p} />)
        )}
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} makeHref={makeHref} />
    </div>
  );
}
