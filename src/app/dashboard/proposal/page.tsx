import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { withdrawProposalAction } from "@/lib/actions/marketplace";
import { ConfirmButton } from "@/components/forms";
import { Badge, Card, EmptyState, buttonCls } from "@/components/ui";
import { listProviderProposals } from "@/lib/repos/projects";
import { formatRupiah, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Proposal Saya" };

const STATUS: Record<string, { label: string; tone: "sand" | "green" | "red" | "outline" }> = {
  sent: { label: "Menunggu klien", tone: "sand" },
  accepted: { label: "Diterima 🎉", tone: "green" },
  declined: { label: "Ditolak", tone: "red" },
  withdrawn: { label: "Ditarik", tone: "outline" },
};

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<{ terkirim?: string }> }) {
  const { terkirim } = await searchParams;
  const user = await requireUser(undefined, "/dashboard/proposal");
  if (user.role !== "provider") redirect("/dashboard");
  const proposals = listProviderProposals(user.id);

  return (
    <div>
      {terkirim && (
        <p role="status" className="mb-4 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
          Proposal terkirim! Klien akan meninjaunya — kamu akan diberi tahu begitu ada keputusan.
        </p>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Proposal Saya</h1>
      {proposals.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada proposal terkirim"
            hint="Jelajahi proyek terbuka dan kirim penawaran terbaikmu."
            action={
              <Link href="/proyek" className={buttonCls("primary", "sm")}>
                Lihat proyek terbuka
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {proposals.map((p) => {
            const st = STATUS[p.status] ?? STATUS.sent;
            return (
              <Card key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/proyek/${p.project_id}`} className="font-bold text-navy hover:text-red">
                    {p.project_title}
                  </Link>
                  <p className="text-sm text-navy-mist">
                    tawaranmu {formatRupiah(p.price)} · {p.estimated_days} hari · {timeAgo(p.created_at)}
                  </p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
                {p.status === "sent" && (
                  <form action={withdrawProposalAction.bind(null, p.id)}>
                    <ConfirmButton message="Tarik proposal ini? Kamu tidak bisa mengirim ulang ke proyek yang sama." className={buttonCls("ghost", "sm")}>
                      Tarik
                    </ConfirmButton>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
