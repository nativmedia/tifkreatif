import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
import { listClientProjects } from "@/lib/repos/projects";
import { formatRupiahRange, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Proyek Saya" };

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "sand" | "navy" | "red" }> = {
  open: { label: "Menerima proposal", tone: "green" },
  awarded: { label: "Sudah ada pemenang", tone: "navy" },
  closed: { label: "Ditutup", tone: "sand" },
  cancelled: { label: "Dibatalkan", tone: "red" },
};

export default async function MyProjectsPage() {
  const user = await requireUser(undefined, "/dashboard/proyek");
  if (user.role !== "client") redirect("/dashboard");
  const projects = listClientProjects(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Proyek Saya</h1>
        <ButtonLink href="/dashboard/proyek/baru" size="sm">
          Pasang proyek baru
        </ButtonLink>
      </div>
      {projects.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Kamu belum memasang proyek"
            hint="Ceritakan kebutuhanmu sekali, dan biarkan para talenta datang membawa penawaran terbaik mereka."
            action={<ButtonLink href="/dashboard/proyek/baru" size="sm">Pasang proyek pertama</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {projects.map((p) => {
            const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.open;
            return (
              <Card key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/proyek/${p.id}`} className="font-bold text-navy hover:text-red">
                    {p.title}
                  </Link>
                  <p className="text-sm text-navy-mist">
                    {p.kind === "direct" ? "Brief langsung" : "Proyek terbuka"} · {formatRupiahRange(p.budget_min, p.budget_max)} · {timeAgo(p.created_at)}
                  </p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
                <Badge tone="outline">{p.proposal_count} proposal</Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
