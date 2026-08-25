import type { Metadata } from "next";
import Link from "next/link";
import { Card, Stat } from "@/components/ui";
import { platformStats } from "@/lib/repos/admin";

export const metadata: Metadata = { title: "Admin" };

export default function AdminHomePage() {
  const s = platformStats();
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Ringkasan platform</h1>
      <p className="mt-1 text-sm text-navy-mist">Angka berjalan dari database (termasuk data demo berlabel).</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total pengguna" value={s.users} />
        <Stat label="Talenta" value={s.providers} />
        <Stat label="Klien" value={s.clients} />
        <Stat label="Layanan aktif" value={s.services} />
        <Stat label="Proyek terbuka" value={s.openProjects} />
        <Stat label="Total pesanan" value={s.orders} />
        <Stat label="Pesanan selesai" value={s.completed} />
        <Stat label="Ulasan masuk" value={s.reviews} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card className={`p-5 ${s.pendingVerifications > 0 ? "border-gold bg-gold-tint/40" : ""}`}>
          <p className="text-sm font-semibold text-navy-mist">Butuh perhatian</p>
          <p className="mt-1 text-2xl font-extrabold text-navy">{s.pendingVerifications} permintaan verifikasi</p>
          <Link href="/admin/verifikasi" className="mt-2 inline-block text-sm font-bold text-red hover:underline">
            Tinjau sekarang →
          </Link>
        </Card>
        <Card className={`p-5 ${s.openReports > 0 ? "border-red bg-red-tint/30" : ""}`}>
          <p className="text-sm font-semibold text-navy-mist">Moderasi</p>
          <p className="mt-1 text-2xl font-extrabold text-navy">{s.openReports} laporan terbuka</p>
          <Link href="/admin/laporan" className="mt-2 inline-block text-sm font-bold text-red hover:underline">
            Tangani laporan →
          </Link>
        </Card>
      </div>
    </div>
  );
}
