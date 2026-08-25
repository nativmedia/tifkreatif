import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import { listDirectBriefs } from "@/lib/repos/projects";
import { formatRupiah, timeAgo } from "@/lib/format";
import { WORK_MODE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Brief Masuk" };

export default async function BriefPage() {
  const user = await requireUser(undefined, "/dashboard/brief");
  if (user.role !== "provider") redirect("/dashboard");
  const briefs = listDirectBriefs(user.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Brief Masuk</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Klien mengirim brief ini khusus untukmu dari halaman profil publikmu. Balas dengan proposal berisi harga
        dan estimasi.
      </p>
      {briefs.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada brief langsung"
            hint="Lengkapi portofolio dan layananmu — profil yang meyakinkan mengundang lebih banyak brief."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {briefs.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy">{b.title}</p>
                  <p className="text-sm text-navy-mist">
                    dari {b.client_name} · {b.kabupaten} · {WORK_MODE_LABEL[b.work_mode]} · budget s.d.{" "}
                    {formatRupiah(b.budget_max)} · {timeAgo(b.created_at)}
                  </p>
                </div>
                {b.status === "open" && b.proposal_count === 0 ? (
                  <ButtonLink href={`/proyek/${b.id}`} size="sm">
                    Kirim proposal
                  </ButtonLink>
                ) : (
                  <ButtonLink href={`/proyek/${b.id}`} size="sm" variant="outline">
                    Lihat brief
                  </ButtonLink>
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-soft">{b.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
