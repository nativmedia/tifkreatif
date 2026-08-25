import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { acceptProposalAction, closeProjectAction, declineProposalAction } from "@/lib/actions/marketplace";
import { ConfirmButton } from "@/components/forms";
import { Avatar, Badge, ButtonLink, Card, EmptyState, Rating, VerifiedBadge, buttonCls } from "@/components/ui";
import { getProject, listProjectProposals } from "@/lib/repos/projects";
import { formatRupiah, formatRupiahRange, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Detail Proyek" };

export default async function ClientProjectDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dibuat?: string }>;
}) {
  const { id } = await params;
  const { dibuat } = await searchParams;
  const user = await requireUser(undefined, `/dashboard/proyek/${id}`);
  if (user.role !== "client") redirect("/dashboard");

  const project = getProject(id);
  if (!project || project.client_id !== user.id) notFound();
  const proposals = listProjectProposals(id);

  return (
    <div>
      {dibuat && (
        <p role="status" className="mb-4 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
          Proyek berhasil dipasang! Talenta kini bisa melihat dan mengirim proposal.
        </p>
      )}

      <nav aria-label="Breadcrumb" className="text-sm text-navy-mist">
        <Link href="/dashboard/proyek" className="hover:text-red">
          Proyek Saya
        </Link>{" "}
        / <span className="text-navy-soft">{project.title}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">{project.title}</h1>
          <p className="mt-1 text-sm text-navy-mist">
            {project.kind === "direct" ? "Brief langsung" : "Proyek terbuka"} ·{" "}
            {formatRupiahRange(project.budget_min, project.budget_max)} · dipasang {timeAgo(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={project.status === "open" ? "green" : project.status === "awarded" ? "navy" : "sand"}>
            {project.status === "open" ? "Menerima proposal" : project.status === "awarded" ? "Sudah ada pemenang" : "Ditutup"}
          </Badge>
          {project.status === "open" && (
            <form action={closeProjectAction.bind(null, project.id)}>
              <ConfirmButton
                message="Tutup proyek ini? Talenta tidak lagi bisa mengirim proposal."
                className={buttonCls("outline", "sm")}
              >
                Tutup proyek
              </ConfirmButton>
            </form>
          )}
        </div>
      </div>

      <Card className="mt-4 p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-navy-soft">{project.description}</p>
      </Card>

      <section className="mt-8" aria-labelledby="daftar-proposal">
        <h2 id="daftar-proposal" className="text-lg font-extrabold text-navy">
          Proposal masuk <span className="font-normal text-navy-mist">({proposals.length})</span>
        </h2>

        {proposals.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Belum ada proposal"
              hint="Proposal biasanya mulai masuk dalam 1–2 hari. Pastikan budget dan deskripsimu jelas."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {proposals.map((pr) => (
              <Card key={pr.id} className="p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar name={pr.provider_name} hue={pr.provider_hue} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-bold text-navy">
                      <Link href={`/talenta/${pr.provider_username}`} className="hover:text-red">
                        {pr.provider_name}
                      </Link>
                      {pr.is_verified === 1 && <VerifiedBadge small />}
                    </p>
                    <p className="text-sm text-navy-mist">
                      <Rating value={pr.rating} count={pr.review_count} size={13} /> · {timeAgo(pr.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-navy">{formatRupiah(pr.price)}</p>
                    <p className="text-sm text-navy-mist">{pr.estimated_days} hari kerja</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line rounded-lg bg-sand/60 p-3 text-sm leading-relaxed text-navy-soft">
                  {pr.message}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {pr.status === "sent" && project.status === "open" ? (
                    <>
                      <form action={acceptProposalAction.bind(null, pr.id)}>
                        <ConfirmButton
                          message={`Terima proposal ${pr.provider_name} senilai ${formatRupiah(pr.price)}? Proposal lain akan otomatis ditolak dan ruang pesanan dibuka.`}
                          className={buttonCls("primary", "sm")}
                        >
                          Terima proposal
                        </ConfirmButton>
                      </form>
                      <form action={declineProposalAction.bind(null, pr.id, project.id)}>
                        <ConfirmButton message={`Tolak proposal dari ${pr.provider_name}?`} className={buttonCls("outline", "sm")}>
                          Tolak
                        </ConfirmButton>
                      </form>
                    </>
                  ) : (
                    <Badge
                      tone={pr.status === "accepted" ? "green" : pr.status === "declined" ? "red" : "sand"}
                    >
                      {pr.status === "accepted" ? "Diterima" : pr.status === "declined" ? "Ditolak" : "Menunggu"}
                    </Badge>
                  )}
                  <ButtonLink href={`/talenta/${pr.provider_username}`} variant="ghost" size="sm">
                    Lihat profil
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
