import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ButtonLink, Card, EmptyState, Rating, Stat, StatusBadge, VerifiedBadge } from "@/components/ui";
import { VerificationForm } from "@/components/forms";
import { listOrdersFor, providerStats } from "@/lib/repos/orders";
import { listClientIncomingProposals, listClientProjects, listDirectBriefs } from "@/lib/repos/projects";
import { listFavorites, getPendingVerification } from "@/lib/repos/social";
import { getProviderProfileRaw } from "@/lib/repos/users";
import { formatRupiah, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ "selamat-datang"?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser(undefined, "/dashboard");
  const firstName = user.full_name.split(" ")[0];

  const welcome = sp["selamat-datang"] && (
    <p role="status" className="mb-5 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
      Selamat datang di TIFKREATIF, {firstName}!{" "}
      {sp["selamat-datang"] === "talenta"
        ? "Lengkapi profil dan buka layanan pertamamu supaya mudah ditemukan klien."
        : "Mulai dengan mencari talenta atau memasang proyek pertamamu."}
    </p>
  );

  if (user.role === "provider") {
    const stats = providerStats(user.id);
    const briefs = listDirectBriefs(user.id);
    const orders = listOrdersFor(user.id, "provider").slice(0, 5);
    const pp = getProviderProfileRaw(user.id);
    const pendingVerif = getPendingVerification(user.id);

    return (
      <div>
        {welcome}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Halo, {firstName} 👋</h1>
          {pp?.username && (
            <ButtonLink href={`/talenta/${pp.username}`} variant="outline" size="sm">
              Lihat profil publikku
            </ButtonLink>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Permintaan masuk" value={stats.incoming} accent={stats.incoming > 0} />
          <Stat label="Pesanan berjalan" value={stats.activeOrders} />
          <Stat label="Pesanan selesai" value={stats.completedOrders} />
          <Card className="px-4 py-3">
            <div className="text-2xl font-extrabold tracking-tight text-navy">
              <Rating value={stats.rating} count={stats.reviewCount} size={20} />
            </div>
            <p className="text-sm text-navy-mist">Rating dari klien</p>
          </Card>
        </div>

        {/* Verifikasi */}
        {pp?.is_verified ? (
          <Card className="mt-5 flex items-center gap-3 border-green bg-green-tint/40 p-4">
            <VerifiedBadge />
            <p className="text-sm text-navy-soft">Profilmu sudah terverifikasi — lencana tampil di semua pencarian.</p>
          </Card>
        ) : pendingVerif ? (
          <Card className="mt-5 border-gold bg-gold-tint/40 p-4 text-sm text-navy-soft">
            Permintaan verifikasimu sedang ditinjau tim kami (diajukan {timeAgo(pendingVerif.created_at)}).
          </Card>
        ) : (
          <Card className="mt-5 p-5">
            <p className="font-bold text-navy">Ajukan verifikasi profil — gratis</p>
            <p className="mt-1 text-sm text-navy-mist">
              Talenta terverifikasi tampil lebih menonjol dan lebih dipercaya klien.
            </p>
            <div className="mt-3 max-w-lg">
              <VerificationForm />
            </div>
          </Card>
        )}

        {/* Brief langsung */}
        <section className="mt-8" aria-labelledby="brief-masuk">
          <div className="flex items-center justify-between">
            <h2 id="brief-masuk" className="text-lg font-extrabold text-navy">
              Brief langsung untukmu
            </h2>
            <Link href="/dashboard/brief" className="link-quiet text-sm font-semibold">
              Semua brief
            </Link>
          </div>
          {briefs.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Belum ada brief langsung" hint="Klien bisa mengirim brief dari halaman profil publikmu." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {briefs.slice(0, 3).map((b) => (
                <Card key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy">{b.title}</p>
                    <p className="text-sm text-navy-mist">
                      dari {b.client_name} · budget s.d. {formatRupiah(b.budget_max)} · {timeAgo(b.created_at)}
                    </p>
                  </div>
                  <ButtonLink href={`/proyek/${b.id}`} size="sm">
                    Tinjau & balas
                  </ButtonLink>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Pesanan terbaru */}
        <section className="mt-8" aria-labelledby="pesanan-terbaru">
          <div className="flex items-center justify-between">
            <h2 id="pesanan-terbaru" className="text-lg font-extrabold text-navy">
              Pesanan terbaru
            </h2>
            <Link href="/dashboard/pesanan" className="link-quiet text-sm font-semibold">
              Semua pesanan
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Belum ada pesanan" hint="Pesanan muncul saat klien memesan paketmu atau menerima proposalmu." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {orders.map((o) => (
                <Card key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/pesanan/${o.id}`} className="font-bold text-navy hover:text-red">
                      {o.title}
                    </Link>
                    <p className="text-sm text-navy-mist">
                      klien: {o.client_name} · {formatRupiah(o.agreed_price)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ── Klien ─────────────────────────────────────────────────── */
  const projects = listClientProjects(user.id);
  const proposals = listClientIncomingProposals(user.id, 4);
  const orders = listOrdersFor(user.id, "client");
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const favorites = listFavorites(user.id);

  return (
    <div>
      {welcome}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Halo, {firstName} 👋</h1>
        <ButtonLink href="/dashboard/proyek/baru" size="sm">
          Pasang proyek baru
        </ButtonLink>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Proyek terpasang" value={projects.filter((p) => p.status === "open").length} />
        <Stat label="Proposal menunggu" value={proposals.length} accent={proposals.length > 0} />
        <Stat label="Pesanan berjalan" value={activeOrders.length} />
        <Stat label="Talenta favorit" value={favorites.length} />
      </div>

      <section className="mt-8" aria-labelledby="proposal-masuk">
        <div className="flex items-center justify-between">
          <h2 id="proposal-masuk" className="text-lg font-extrabold text-navy">
            Proposal terbaru untukmu
          </h2>
          <Link href="/dashboard/proyek" className="link-quiet text-sm font-semibold">
            Kelola proyek
          </Link>
        </div>
        {proposals.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Belum ada proposal menunggu"
              hint="Pasang proyek terbuka dan talenta akan datang membawa penawaran."
              action={<ButtonLink href="/dashboard/proyek/baru" size="sm">Pasang proyek</ButtonLink>}
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {proposals.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy">
                    {p.provider_name}{" "}
                    <span className="font-normal text-navy-mist">menawar {formatRupiah(p.price)}</span>
                  </p>
                  <p className="text-sm text-navy-mist">
                    untuk “{p.project_title}” · {p.estimated_days} hari · {timeAgo(p.created_at)}
                  </p>
                </div>
                <ButtonLink href={`/dashboard/proyek/${p.project_id}`} size="sm" variant="secondary">
                  Tinjau proposal
                </ButtonLink>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="pesanan-berjalan">
        <div className="flex items-center justify-between">
          <h2 id="pesanan-berjalan" className="text-lg font-extrabold text-navy">
            Pesanan berjalan
          </h2>
          <Link href="/dashboard/pesanan" className="link-quiet text-sm font-semibold">
            Semua pesanan
          </Link>
        </div>
        {activeOrders.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Tidak ada pesanan aktif"
              hint="Pesan paket dari halaman layanan atau terima proposal untuk memulai."
              action={<ButtonLink href="/talenta" size="sm" variant="outline">Cari talenta</ButtonLink>}
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {activeOrders.slice(0, 5).map((o) => (
              <Card key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/pesanan/${o.id}`} className="font-bold text-navy hover:text-red">
                    {o.title}
                  </Link>
                  <p className="text-sm text-navy-mist">
                    talenta: {o.provider_name} · {formatRupiah(o.agreed_price)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
