import type { Metadata } from "next";
import Link from "next/link";
import { resolveReportAction } from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/forms";
import { Badge, Card, EmptyState, buttonCls } from "@/components/ui";
import { listReports } from "@/lib/repos/admin";
import { getDb } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Laporan" };

function targetLink(type: string, id: string): { label: string; href: string | null } {
  const db = getDb();
  if (type === "service") {
    const s = db.prepare("SELECT title, slug FROM services WHERE id = ?").get(id) as { title: string; slug: string } | undefined;
    return s ? { label: `Layanan: ${s.title}`, href: `/layanan/${s.slug}` } : { label: "Layanan (terhapus)", href: null };
  }
  if (type === "user") {
    const u = db
      .prepare("SELECT p.full_name, pp.username FROM profiles p LEFT JOIN provider_profiles pp ON pp.user_id = p.user_id WHERE p.user_id = ?")
      .get(id) as { full_name: string; username: string | null } | undefined;
    return u ? { label: `Pengguna: ${u.full_name}`, href: u.username ? `/talenta/${u.username}` : null } : { label: "Pengguna (terhapus)", href: null };
  }
  if (type === "project") {
    const p = db.prepare("SELECT title FROM projects WHERE id = ?").get(id) as { title: string } | undefined;
    return p ? { label: `Proyek: ${p.title}`, href: `/proyek/${id}` } : { label: "Proyek (terhapus)", href: null };
  }
  return { label: `${type} · ${id}`, href: null };
}

export default function AdminLaporanPage() {
  const reports = listReports();
  const open = reports.filter((r) => r.status === "open");
  const closed = reports.filter((r) => r.status !== "open");

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Laporan Konten</h1>
      <p className="mt-1 text-sm text-navy-mist">Tangani laporan pelanggaran dari pengguna.</p>

      <section className="mt-5" aria-labelledby="terbuka">
        <h2 id="terbuka" className="font-extrabold text-navy">
          Terbuka ({open.length})
        </h2>
        {open.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Tidak ada laporan terbuka" hint="Kerja bagus — kotak masuk moderasi bersih." />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {open.map((r) => {
              const t = targetLink(r.target_type, r.target_id);
              return (
                <Card key={r.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {t.href ? (
                      <Link href={t.href} className="font-bold text-navy hover:text-red">
                        {t.label}
                      </Link>
                    ) : (
                      <p className="font-bold text-navy">{t.label}</p>
                    )}
                    <p className="text-xs text-navy-mist">
                      oleh {r.reporter_name} · {timeAgo(r.created_at)}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-line rounded-lg bg-sand/60 p-3 text-sm text-navy-soft">{r.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={resolveReportAction.bind(null, r.id, "resolved")}>
                      <ConfirmButton message="Tandai laporan ini selesai ditangani?" className={buttonCls("primary", "sm")}>
                        Tandai ditangani
                      </ConfirmButton>
                    </form>
                    <form action={resolveReportAction.bind(null, r.id, "dismissed")}>
                      <ConfirmButton message="Abaikan laporan ini (tidak ada pelanggaran)?" className={buttonCls("outline", "sm")}>
                        Abaikan
                      </ConfirmButton>
                    </form>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section className="mt-8">
          <h2 className="font-extrabold text-navy">Riwayat</h2>
          <Card className="mt-3 divide-y divide-sand-line">
            {closed.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 p-3.5 text-sm">
                <span className="text-navy-soft">{targetLink(r.target_type, r.target_id).label}</span>
                <span className="ml-auto">
                  <Badge tone={r.status === "resolved" ? "green" : "sand"}>
                    {r.status === "resolved" ? "Ditangani" : "Diabaikan"}
                  </Badge>
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
