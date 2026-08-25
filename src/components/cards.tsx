import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { Avatar, Badge, Card, DemoBadge, Rating, VerifiedBadge } from "@/components/ui";
import { PortfolioCover } from "@/components/covers";
import { AVAILABILITY_LABEL, WORK_MODE_LABEL } from "@/lib/constants";
import { formatDate, formatRupiah, formatRupiahRange, timeAgo, truncate } from "@/lib/format";
import type { ProjectCard as ProjectCardT, ProviderCard as ProviderCardT, Review, ServiceCard as ServiceCardT } from "@/lib/types";

export function ProviderCard({ p }: { p: ProviderCardT }) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start gap-3">
        <Avatar name={p.full_name} hue={p.avatar_hue} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/talenta/${p.username}`} className="font-bold text-navy hover:text-red">
              {p.full_name}
            </Link>
            {p.is_verified === 1 && <VerifiedBadge small />}
            {p.is_demo === 1 && <DemoBadge />}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-navy-soft">{p.headline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy-mist">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} aria-hidden="true" /> {p.kabupaten}
        </span>
        <Rating value={p.rating} count={p.review_count} />
        <span className={p.availability === "tersedia" ? "text-green" : ""}>{AVAILABILITY_LABEL[p.availability]}</span>
      </div>

      {p.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 3).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-sand-line pt-3">
        <p className="text-sm text-navy-mist">
          {p.starting_price ? (
            <>
              Mulai <span className="font-bold text-navy">{formatRupiah(p.starting_price)}</span>
            </>
          ) : (
            "Harga menyesuaikan brief"
          )}
        </p>
        <Link href={`/talenta/${p.username}`} className="text-sm font-bold text-red hover:underline">
          Lihat profil
        </Link>
      </div>
    </Card>
  );
}

export function ServiceCard({ s }: { s: ServiceCardT }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link href={`/layanan/${s.slug}`} className="block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <PortfolioCover seed={s.cover_seed} label={s.title} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-mist">{s.category_name}</p>
        <Link href={`/layanan/${s.slug}`} className="mt-1 line-clamp-2 font-bold text-navy hover:text-red">
          {s.title}
        </Link>
        <div className="mt-2 flex items-center gap-2 text-sm text-navy-soft">
          <span className="inline-flex items-center gap-1">
            {s.provider_name}
            {s.is_verified === 1 && <BadgeCheck size={14} className="text-green" aria-label="Terverifikasi" />}
          </span>
          <span aria-hidden="true">·</span>
          <span>{s.provider_kabupaten}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <Rating value={s.rating} count={s.review_count} />
          <p className="text-sm text-navy-mist">
            Mulai <span className="font-extrabold text-navy">{s.min_price ? formatRupiah(s.min_price) : "-"}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

export function ProjectListCard({ p }: { p: ProjectCardT }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-navy-mist">
        <Badge tone="gold">{p.category_name}</Badge>
        <span className="inline-flex items-center gap-1">
          <MapPin size={13} aria-hidden="true" /> {p.kabupaten} · {WORK_MODE_LABEL[p.work_mode]}
        </span>
        <span aria-hidden="true">·</span>
        <span>{timeAgo(p.created_at)}</span>
      </div>
      <Link href={`/proyek/${p.id}`} className="mt-2 block text-lg font-bold text-navy hover:text-red">
        {p.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-sm text-navy-soft">{truncate(p.description, 220)}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sand-line pt-3 text-sm">
        <p className="font-bold text-navy">
          {formatRupiahRange(p.budget_min, p.budget_max)}
          {p.deadline && (
            <span className="ml-3 inline-flex items-center gap-1 font-normal text-navy-mist">
              <CalendarDays size={14} aria-hidden="true" /> tenggat {formatDate(p.deadline)}
            </span>
          )}
        </p>
        <p className="text-navy-mist">
          {p.proposal_count} proposal · oleh {p.client_name}
        </p>
      </div>
    </Card>
  );
}

export function ReviewItem({ r }: { r: Review }) {
  return (
    <div className="border-b border-sand-line py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <Avatar name={r.client_name ?? "Klien"} hue={r.client_hue ?? 200} size={36} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-navy">
            {r.client_name}
            {r.is_demo === 1 && <DemoBadge />}
          </p>
          <p className="text-xs text-navy-mist">
            {r.order_title ? `${r.order_title} · ` : ""}
            {formatDate(r.created_at)}
          </p>
        </div>
        <span className="ml-auto">
          <Rating value={r.rating} showEmpty={false} />
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-navy-soft">{r.comment}</p>
    </div>
  );
}

export function Pagination({
  page,
  total,
  perPage,
  makeHref,
}: {
  page: number;
  total: number;
  perPage: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );
  const withGaps: (number | "…")[] = [];
  items.forEach((n, i) => {
    if (i > 0 && n - items[i - 1] > 1) withGaps.push("…");
    withGaps.push(n);
  });
  return (
    <nav aria-label="Navigasi halaman" className="mt-8 flex items-center justify-center gap-1.5">
      {withGaps.map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-navy-mist">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={makeHref(n)}
            aria-current={n === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
              n === page ? "bg-navy text-bone" : "bg-white text-navy-soft border border-sand-line hover:border-navy-mist"
            }`}
          >
            {n}
          </Link>
        )
      )}
    </nav>
  );
}
