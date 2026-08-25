import type { Metadata } from "next";
import { Card, Stat } from "@/components/ui";
import { platformStats } from "@/lib/repos/admin";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Misi TIFKREATIF: menghubungkan talenta kreatif Madura dengan klien yang membutuhkannya.",
};

export default function TentangPage() {
  const stats = platformStats();
  return (
    <div className="container-tif py-10">
      <p className="eyebrow">Tentang TIFKREATIF</p>
      <h1 className="mt-1 max-w-3xl text-3xl font-extrabold tracking-tight text-navy">
        Talenta Madura itu ada — selama ini hanya kurang etalase.
      </h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="max-w-2xl space-y-4 leading-relaxed text-navy-soft">
          <p>
            Di Bangkalan ada fotografer wedding yang jadwalnya penuh dari mulut ke mulut. Di Pamekasan ada
            desainer yang karyanya dipakai toko batik se-kabupaten. Di Sumenep ada tim kecil yang mengelola media
            sosial belasan usaha lokal. Mereka selama ini ditemukan lewat kenalan, status WhatsApp, dan
            keberuntungan.
          </p>
          <p>
            TIFKREATIF dibangun supaya pertemuan itu tidak lagi bergantung pada keberuntungan. Kami memberi
            talenta kreatif Madura etalase yang layak — portofolio, paket harga yang jelas, dan ulasan yang
            terkumpul — sekaligus memberi klien (UMKM, keluarga, instansi) cara yang rapi untuk mencari,
            menyepakati, dan menyelesaikan pekerjaan kreatif.
          </p>
          <p>
            Nama kami diambil dari semangat <em>T!F</em>: tegas seperti tanda seru, akrab seperti sapaan tetangga.
            Kami percaya ekonomi kreatif Madura bisa tumbuh tanpa harus menyeberang ke Surabaya — cukup diberi
            panggung dan alat kerja yang benar.
          </p>
          <p className="rounded-xl bg-sand px-4 py-3 text-sm">
            <strong>Transparansi:</strong> yang kamu lihat sekarang adalah versi MVP. Sebagian konten adalah data
            demo (selalu diberi label) untuk menggambarkan pengalaman lengkapnya.
          </p>
        </div>
        <aside className="space-y-3">
          <Stat label="Talenta terdaftar (demo)" value={stats.providers} />
          <Stat label="Layanan aktif (demo)" value={stats.services} />
          <Stat label="Proyek selesai (demo)" value={stats.completed} accent />
          <Card className="p-4 text-sm text-navy-soft">
            Meliputi 4 kabupaten: Bangkalan, Sampang, Pamekasan, dan Sumenep — plus talenta yang melayani
            Surabaya dan luar Madura secara remote.
          </Card>
        </aside>
      </div>
    </div>
  );
}
