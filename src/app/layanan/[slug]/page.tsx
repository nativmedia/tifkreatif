import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Flag, RefreshCcw } from "lucide-react";
import { PortfolioCover } from "@/components/covers";
import { OrderPackageForm, ReportForm } from "@/components/forms";
import { Avatar, Badge, ButtonLink, Card, Rating, VerifiedBadge } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { getServiceBySlug } from "@/lib/repos/catalog";
import { TIER_LABEL } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getServiceBySlug(slug);
  if (!s) return { title: "Layanan tidak ditemukan" };
  return { title: s.title, description: s.description.slice(0, 155) };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service || service.is_active !== 1) notFound();
  const user = await getSessionUser();
  const isOwner = user?.id === service.provider_id;

  return (
    <div className="container-tif py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-navy-mist">
        <Link href="/talenta" className="hover:text-red">
          Talenta
        </Link>{" "}
        /{" "}
        <Link href={`/talenta/${service.provider_username}`} className="hover:text-red">
          {service.provider_name}
        </Link>{" "}
        / <span className="text-navy-soft">{service.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Kiri: info layanan */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{service.category_name}</Badge>
            {service.is_verified === 1 && <VerifiedBadge small />}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{service.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-mist">
            <Rating value={service.rating} count={service.review_count} />
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} aria-hidden="true" /> estimasi umum {service.estimated_days} hari
            </span>
            <span className="inline-flex items-center gap-1">
              <RefreshCcw size={14} aria-hidden="true" /> hingga {service.revision_count}x revisi
            </span>
          </div>

          <div className="mt-5 aspect-[16/9] overflow-hidden rounded-2xl border border-sand-line">
            <PortfolioCover seed={service.cover_seed} label={service.title} />
          </div>
          <p className="mt-1.5 text-xs text-navy-mist">Ilustrasi sampul dibuat otomatis — contoh karya asli ada di portofolio talenta.</p>

          <section className="mt-6" aria-labelledby="deskripsi">
            <h2 id="deskripsi" className="text-lg font-extrabold text-navy">
              Tentang layanan ini
            </h2>
            <p className="mt-2 max-w-2xl whitespace-pre-line leading-relaxed text-navy-soft">{service.description}</p>
          </section>

          {/* Penyedia */}
          <section className="mt-8" aria-labelledby="penyedia">
            <h2 id="penyedia" className="sr-only">
              Penyedia layanan
            </h2>
            <Card className="flex flex-wrap items-center gap-4 p-5">
              <Avatar name={service.provider_name} hue={200} size={52} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold text-navy">
                  {service.provider_name}
                  {service.is_verified === 1 && <VerifiedBadge small />}
                </p>
                <p className="text-sm text-navy-mist">
                  {service.provider_kabupaten}, Madura · <Rating value={service.rating} count={service.review_count} size={13} />
                </p>
              </div>
              <ButtonLink href={`/talenta/${service.provider_username}`} variant="outline" size="sm">
                Lihat profil & portofolio
              </ButtonLink>
            </Card>
          </section>

          {user && !isOwner && (
            <details className="mt-6 rounded-xl border border-sand-line bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-navy-mist hover:text-red [&::-webkit-details-marker]:hidden">
                <Flag size={14} aria-hidden="true" /> Laporkan layanan ini
              </summary>
              <div className="mt-3">
                <ReportForm targetType="service" targetId={service.id} />
              </div>
            </details>
          )}
        </div>

        {/* Kanan: paket */}
        <aside aria-labelledby="paket">
          <h2 id="paket" className="text-lg font-extrabold text-navy lg:sr-only">
            Pilih paket
          </h2>
          <div className="mt-2 space-y-4 lg:sticky lg:top-20 lg:mt-0">
            {service.packages.map((pkg) => {
              const deliverables = JSON.parse(pkg.deliverables) as string[];
              const highlighted = pkg.tier === "standard" && service.packages.length > 1;
              return (
                <Card key={pkg.id} className={`p-5 ${highlighted ? "border-red ring-1 ring-red" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={highlighted ? "red" : "sand"}>{TIER_LABEL[pkg.tier]}</Badge>
                    {highlighted && <span className="text-xs font-bold text-red">Paling dipilih</span>}
                  </div>
                  <p className="mt-2 font-bold text-navy">{pkg.name}</p>
                  <p className="text-2xl font-extrabold tracking-tight text-navy">{formatRupiah(pkg.price)}</p>
                  {pkg.description && <p className="mt-1 text-sm text-navy-soft">{pkg.description}</p>}
                  <ul className="mt-3 space-y-1.5">
                    {deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-navy-soft">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green" aria-hidden="true" />
                        {d}
                      </li>
                    ))}
                    <li className="flex items-start gap-2 text-sm text-navy-mist">
                      <Clock3 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {pkg.estimated_days} hari kerja · {pkg.revision_count}x revisi
                    </li>
                  </ul>

                  <div className="mt-4 border-t border-sand-line pt-4">
                    {isOwner ? (
                      <p className="text-sm text-navy-mist">Ini layananmu — kelola dari dashboard.</p>
                    ) : user?.role === "client" ? (
                      <details>
                        <summary className="flex h-10 cursor-pointer list-none items-center justify-center rounded-lg bg-red font-semibold text-white transition-colors hover:bg-red-deep [&::-webkit-details-marker]:hidden">
                          Pesan paket ini
                        </summary>
                        <div className="mt-3">
                          <OrderPackageForm
                            packageId={pkg.id}
                            serviceSlug={service.slug}
                            packageName={pkg.name}
                            price={pkg.price}
                          />
                        </div>
                      </details>
                    ) : user?.role === "provider" ? (
                      <p className="rounded-lg bg-sand px-3 py-2 text-center text-sm text-navy-soft">
                        Pemesanan dilakukan dari akun klien.
                      </p>
                    ) : (
                      <ButtonLink href={`/masuk?next=/layanan/${service.slug}`} className="w-full">
                        Masuk untuk memesan
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              );
            })}

            {service.addons.length > 0 && (
              <Card className="p-5">
                <p className="font-bold text-navy">Tambahan opsional</p>
                <ul className="mt-2 space-y-1.5 text-sm text-navy-soft">
                  {service.addons.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3">
                      <span>{a.name}</span>
                      <span className="font-semibold text-navy">{formatRupiah(a.price)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-navy-mist">Sebutkan tambahan yang kamu mau di catatan pesanan.</p>
              </Card>
            )}

            <p className="rounded-xl bg-gold-tint px-4 py-3 text-xs leading-relaxed text-[#8a6210]">
              <strong>Catatan pembayaran:</strong> di versi MVP ini pembayaran disepakati langsung dengan talenta
              setelah pesanan diterima. Simpan bukti kesepakatan di ruang chat pesanan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
