import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { toggleServiceAction } from "@/lib/actions/services";
import { Badge, ButtonLink, Card, EmptyState, buttonCls } from "@/components/ui";
import { listServices } from "@/lib/repos/catalog";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Layanan Saya" };

export default async function MyServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ dibuat?: string; tersimpan?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser(undefined, "/dashboard/layanan");
  if (user.role !== "provider") redirect("/dashboard");
  const services = listServices({ providerId: user.id, includeInactive: true, limit: 50 });

  return (
    <div>
      {(sp.dibuat || sp.tersimpan) && (
        <p role="status" className="mb-4 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
          {sp.dibuat ? "Layanan berhasil diterbitkan dan kini tampil di profilmu!" : "Perubahan layanan tersimpan."}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Layanan Saya</h1>
        <ButtonLink href="/dashboard/layanan/baru" size="sm">
          Buka layanan baru
        </ButtonLink>
      </div>
      {services.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada layanan"
            hint="Layanan berpaket memudahkan klien memesan tanpa tanya-tanya panjang. Mulai dari satu layanan andalanmu."
            action={<ButtonLink href="/dashboard/layanan/baru" size="sm">Buat layanan pertama</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {services.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/layanan/${s.slug}`} className="font-bold text-navy hover:text-red">
                  {s.title}
                </Link>
                <p className="text-sm text-navy-mist">
                  {s.category_name} · mulai {s.min_price ? formatRupiah(s.min_price) : "-"}
                </p>
              </div>
              <Badge tone={s.is_active ? "green" : "sand"}>{s.is_active ? "Aktif" : "Nonaktif"}</Badge>
              <ButtonLink href={`/dashboard/layanan/${s.id}`} variant="outline" size="sm">
                Ubah
              </ButtonLink>
              <form action={toggleServiceAction.bind(null, s.id)}>
                <button className={buttonCls("ghost", "sm")}>{s.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
