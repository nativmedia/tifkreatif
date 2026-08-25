import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Flag, Heart, MapPin, Send } from "lucide-react";
import { PortfolioCover } from "@/components/covers";
import { ReviewItem, ServiceCard } from "@/components/cards";
import { BriefForm, ReportForm } from "@/components/forms";
import { Avatar, Badge, ButtonLink, Card, DemoBadge, EmptyState, Rating, VerifiedBadge, buttonCls } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { toggleFavoriteAction } from "@/lib/actions/marketplace";
import { getProviderByUsername, listCategories, listPortfolio, listProviderReviews, listServices } from "@/lib/repos/catalog";
import { isFavorited } from "@/lib/repos/social";
import { AVAILABILITY_LABEL } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const p = getProviderByUsername(username);
  if (!p) return { title: "Talenta tidak ditemukan" };
  return {
    title: `${p.full_name} (@${p.username})`,
    description: `${p.headline} — talenta kreatif dari ${p.kabupaten}, Madura.`,
  };
}

export default async function ProviderProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ brief?: string }>;
}) {
  const { username } = await params;
  const { brief } = await searchParams;
  const provider = getProviderByUsername(username);
  if (!provider) notFound();

  const user = await getSessionUser();
  const services = listServices({ providerId: provider.user_id, limit: 12 });
  const portfolio = listPortfolio(provider.user_id);
  const reviews = listProviderReviews(provider.user_id, 10);
  const categories = listCategories();
  const favorited = user?.role === "client" ? isFavorited(user.id, provider.user_id) : false;
  const isOwner = user?.id === provider.user_id;

  return (
    <div className="container-tif py-8">
      {brief === "terkirim" && (
        <p role="status" className="mb-4 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
          Brief terkirim! {provider.full_name} akan meninjaunya — pantau balasannya lewat notifikasi dan halaman Pesan.
        </p>
      )}

      {/* Kartu profil utama */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-navy" aria-hidden="true" />
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
          <Avatar name={provider.full_name} hue={provider.avatar_hue} size={84} className="ring-4 ring-sand" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-navy">{provider.full_name}</h1>
              {provider.is_verified === 1 && <VerifiedBadge />}
              {provider.is_demo === 1 && <DemoBadge />}
            </div>
            <p className="text-sm text-navy-mist">@{provider.username}</p>
            <p className="mt-2 max-w-2xl font-medium text-navy-soft">{provider.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-navy-mist">
              <span className="inline-flex items-center gap-1">
                <MapPin size={15} aria-hidden="true" /> {provider.kabupaten} · melayani {provider.service_areas.join(", ")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={15} aria-hidden="true" /> respons ±{provider.response_time_hours} jam
              </span>
              <span className={provider.availability === "tersedia" ? "font-semibold text-green" : ""}>
                {AVAILABILITY_LABEL[provider.availability]}
              </span>
            </div>
            <div className="mt-2">
              <Rating value={provider.rating} count={provider.review_count} />
            </div>
            {provider.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.skills.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 md:w-56">
            {isOwner ? (
              <ButtonLink href="/dashboard" variant="secondary">
                Kelola profilku
              </ButtonLink>
            ) : (
              <>
                <a href="#kirim-brief" className={buttonCls("primary")}>
                  <Send size={16} aria-hidden="true" /> Kirim brief langsung
                </a>
                {user?.role === "client" && (
                  <form action={toggleFavoriteAction.bind(null, provider.user_id, `/talenta/${provider.username}`)}>
                    <button className={buttonCls(favorited ? "secondary" : "outline", "md", "w-full")}>
                      <Heart size={16} className={favorited ? "fill-current" : ""} aria-hidden="true" />
                      {favorited ? "Tersimpan di favorit" : "Simpan ke favorit"}
                    </button>
                  </form>
                )}
                {!user && (
                  <p className="text-center text-xs text-navy-mist">
                    <Link href={`/masuk?next=/talenta/${provider.username}`} className="link-quiet font-semibold">
                      Masuk
                    </Link>{" "}
                    untuk mengirim brief atau menyimpan favorit.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          {/* Tentang */}
          {provider.bio && (
            <section aria-labelledby="tentang">
              <h2 id="tentang" className="text-lg font-extrabold text-navy">
                Tentang {provider.full_name.split(" ")[0]}
              </h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-navy-soft">{provider.bio}</p>
            </section>
          )}

          {/* Portofolio */}
          <section aria-labelledby="portofolio">
            <h2 id="portofolio" className="text-lg font-extrabold text-navy">
              Portofolio <span className="font-normal text-navy-mist">({portfolio.length})</span>
            </h2>
            {portfolio.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="Belum ada karya dipajang" hint="Talenta ini belum menambahkan portofolio." />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolio.map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-xl border border-sand-line bg-white">
                    <div className="aspect-[4/3]">
                      <PortfolioCover seed={item.cover_seed} label={item.title} />
                    </div>
                    <figcaption className="p-3">
                      <p className="line-clamp-1 text-sm font-bold text-navy">{item.title}</p>
                      <p className="text-xs text-navy-mist">
                        {[item.category_name, item.year].filter(Boolean).join(" · ")}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          {/* Layanan */}
          <section aria-labelledby="layanan">
            <h2 id="layanan" className="text-lg font-extrabold text-navy">
              Layanan <span className="font-normal text-navy-mist">({services.length})</span>
            </h2>
            {services.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="Belum ada layanan paket" hint="Kamu tetap bisa mengirim brief langsung di kolom samping." />
              </div>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {services.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Ulasan */}
          <section aria-labelledby="ulasan">
            <h2 id="ulasan" className="text-lg font-extrabold text-navy">
              Ulasan klien <span className="font-normal text-navy-mist">({provider.review_count})</span>
            </h2>
            {reviews.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="Belum ada ulasan" hint="Jadilah klien pertama yang bekerja sama dengannya." />
              </div>
            ) : (
              <Card className="mt-3 px-5">
                {reviews.map((r) => (
                  <ReviewItem key={r.id} r={r} />
                ))}
              </Card>
            )}
          </section>
        </div>

        {/* Kolom kanan: brief + laporkan */}
        <aside className="space-y-6">
          {!isOwner && (
            <Card id="kirim-brief" className="scroll-mt-24 p-5">
              <h2 className="font-extrabold text-navy">Kirim brief langsung</h2>
              <p className="mt-1 text-sm text-navy-mist">
                Ceritakan kebutuhanmu — {provider.full_name.split(" ")[0]} akan membalas dengan penawaran.
              </p>
              <div className="mt-4">
                {user?.role === "client" ? (
                  <BriefForm
                    providerId={provider.user_id}
                    providerUsername={provider.username}
                    providerName={provider.full_name}
                    categories={categories}
                  />
                ) : user?.role === "provider" ? (
                  <p className="rounded-lg bg-sand px-3 py-2 text-sm text-navy-soft">
                    Brief hanya bisa dikirim dari akun klien.
                  </p>
                ) : (
                  <ButtonLink href={`/masuk?next=/talenta/${provider.username}`} className="w-full">
                    Masuk untuk mengirim brief
                  </ButtonLink>
                )}
              </div>
            </Card>
          )}

          {user && !isOwner && (
            <details className="rounded-xl border border-sand-line bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-navy-mist hover:text-red [&::-webkit-details-marker]:hidden">
                <Flag size={14} aria-hidden="true" /> Laporkan profil ini
              </summary>
              <div className="mt-3">
                <ReportForm targetType="user" targetId={provider.user_id} />
              </div>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
