import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Wallet } from "lucide-react";
import { ProposalForm } from "@/components/forms";
import { Avatar, Badge, ButtonLink, Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { getProject, hasProposed } from "@/lib/repos/projects";
import { getClientProfile } from "@/lib/repos/users";
import { CLIENT_TYPE_LABEL, WORK_MODE_LABEL } from "@/lib/constants";
import { formatDate, formatRupiahRange, timeAgo } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProject(id);
  if (!p) return { title: "Proyek tidak ditemukan" };
  return { title: p.title, description: p.description.slice(0, 155) };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const user = await getSessionUser();
  const isOwner = user?.id === project.client_id;
  const isDirect = project.kind === "direct";
  // Brief langsung hanya boleh dilihat pemilik & talenta tujuan
  if (isDirect && !isOwner && user?.id !== project.target_provider_id) notFound();

  const clientProfile = getClientProfile(project.client_id);
  const alreadyProposed = user?.role === "provider" ? hasProposed(project.id, user.id) : false;
  const canPropose =
    user?.role === "provider" &&
    project.status === "open" &&
    !alreadyProposed &&
    (!isDirect || project.target_provider_id === user.id);

  return (
    <div className="container-tif py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-navy-mist">
        <Link href="/proyek" className="hover:text-red">
          Proyek Terbuka
        </Link>{" "}
        / <span className="text-navy-soft">{project.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{project.category_name}</Badge>
            {isDirect && <Badge tone="navy">Brief langsung</Badge>}
            {project.status !== "open" && <Badge tone="red">Tidak lagi menerima proposal</Badge>}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{project.title}</h1>
          <p className="mt-1 text-sm text-navy-mist">Dipasang {timeAgo(project.created_at)}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-mist">
                <Wallet size={14} aria-hidden="true" /> Budget
              </p>
              <p className="mt-1 font-extrabold text-navy">{formatRupiahRange(project.budget_min, project.budget_max)}</p>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-mist">
                <MapPin size={14} aria-hidden="true" /> Lokasi & mode
              </p>
              <p className="mt-1 font-extrabold text-navy">
                {project.kabupaten} · {WORK_MODE_LABEL[project.work_mode]}
              </p>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-mist">
                <CalendarDays size={14} aria-hidden="true" /> Tenggat
              </p>
              <p className="mt-1 font-extrabold text-navy">
                {project.deadline ? formatDate(project.deadline) : "Fleksibel"}
              </p>
            </Card>
          </div>

          <section className="mt-6" aria-labelledby="detail">
            <h2 id="detail" className="text-lg font-extrabold text-navy">
              Detail kebutuhan
            </h2>
            <p className="mt-2 max-w-2xl whitespace-pre-line leading-relaxed text-navy-soft">{project.description}</p>
          </section>

          <section className="mt-8" aria-labelledby="klien">
            <h2 id="klien" className="text-lg font-extrabold text-navy">
              Tentang klien
            </h2>
            <Card className="mt-3 flex items-center gap-4 p-5">
              <Avatar name={project.client_name} hue={180} size={48} />
              <div>
                <p className="font-bold text-navy">{project.client_name}</p>
                <p className="text-sm text-navy-mist">
                  {clientProfile ? CLIENT_TYPE_LABEL[clientProfile.client_type] : "Klien"}
                  {clientProfile?.company_name ? ` · ${clientProfile.company_name}` : ""}
                </p>
              </div>
              <p className="ml-auto text-sm text-navy-mist">{project.proposal_count} proposal masuk</p>
            </Card>
          </section>
        </div>

        <aside>
          <div className="space-y-4 lg:sticky lg:top-20">
            {isOwner ? (
              <Card className="p-5">
                <p className="font-bold text-navy">Ini proyekmu</p>
                <p className="mt-1 text-sm text-navy-mist">Tinjau proposal yang masuk dari dashboard.</p>
                <ButtonLink href={`/dashboard/proyek/${project.id}`} className="mt-3 w-full">
                  Lihat proposal ({project.proposal_count})
                </ButtonLink>
              </Card>
            ) : canPropose ? (
              <Card className="p-5">
                <h2 className="font-extrabold text-navy">Kirim proposalmu</h2>
                <p className="mt-1 text-sm text-navy-mist">
                  Satu talenta satu proposal — buat yang terbaik.
                </p>
                <div className="mt-4">
                  <ProposalForm projectId={project.id} />
                </div>
              </Card>
            ) : user?.role === "provider" ? (
              <Card className="p-5">
                <p className="font-bold text-navy">
                  {alreadyProposed ? "Proposalmu sudah terkirim" : "Proposal tidak tersedia"}
                </p>
                <p className="mt-1 text-sm text-navy-mist">
                  {alreadyProposed
                    ? "Pantau statusnya di dashboard — klien akan menghubungimu jika tertarik."
                    : "Proyek ini sudah ditutup atau ditujukan untuk talenta lain."}
                </p>
                {alreadyProposed && (
                  <ButtonLink href="/dashboard/proposal" variant="outline" className="mt-3 w-full">
                    Lihat proposalku
                  </ButtonLink>
                )}
              </Card>
            ) : user?.role === "client" ? (
              <Card className="p-5">
                <p className="font-bold text-navy">Kamu masuk sebagai klien</p>
                <p className="mt-1 text-sm text-navy-mist">Hanya akun talenta yang bisa mengirim proposal.</p>
              </Card>
            ) : (
              <Card className="p-5">
                <p className="font-bold text-navy">Tertarik mengerjakan ini?</p>
                <p className="mt-1 text-sm text-navy-mist">Masuk sebagai talenta untuk mengirim proposal.</p>
                <ButtonLink href={`/masuk?next=/proyek/${project.id}`} className="mt-3 w-full">
                  Masuk
                </ButtonLink>
                <ButtonLink href="/daftar?peran=provider" variant="outline" className="mt-2 w-full">
                  Daftar sebagai talenta
                </ButtonLink>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
