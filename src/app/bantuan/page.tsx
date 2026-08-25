import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Pusat Bantuan" };

const faqs: [string, string][] = [
  ["Bagaimana cara memesan jasa?", "Ada tiga jalur: (1) pesan paket dari halaman layanan, (2) kirim brief langsung dari profil talenta, atau (3) pasang proyek terbuka lalu pilih proposal terbaik. Semuanya berujung ke ruang pesanan tempat kalian berdiskusi dan menyelesaikan pekerjaan."],
  ["Apakah harga di paket bisa dinegosiasi?", "Bisa. Paket adalah titik awal — setelah pesanan diajukan, kalian bebas menyesuaikan lingkup dan harga lewat chat sebelum talenta menerima pesanan."],
  ["Bagaimana sistem pembayarannya?", "Di MVP ini pembayaran disepakati langsung antara klien dan talenta di luar platform (transfer/tunai). Catat kesepakatan di chat pesanan sebagai bukti. Escrow/payment gateway hadir di fase berikutnya."],
  ["Kapan saya bisa memberi ulasan?", "Setelah kamu (klien) menekan Setujui & Selesaikan pada hasil yang dikirim talenta. Satu pesanan satu ulasan, dan ulasan tidak bisa diubah — jadi tulislah dengan jujur."],
  ["Bagaimana cara mendapat lencana Terverifikasi?", "Buka dashboard talenta, ajukan verifikasi dengan bukti karya/identitas usaha. Tim kami meninjau 1–3 hari kerja. Gratis."],
  ["Saya menemukan konten bermasalah, harus bagaimana?", "Gunakan tombol Laporkan yang ada di profil talenta dan halaman layanan. Laporanmu masuk ke tim moderasi dan ditindaklanjuti."],
  ["Apakah data saya aman?", "Kata sandi disimpan dalam bentuk hash, dan file hasil kerja hanya bisa diakses dua pihak dalam pesanan. Detail lain ada di Kebijakan Privasi."],
];

export default function BantuanPage() {
  return (
    <div className="container-tif py-10">
      <p className="eyebrow">Pusat Bantuan</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">Ada yang bisa kami bantu?</h1>
      <p className="mt-2 max-w-2xl text-navy-soft">
        Pertanyaan paling sering kami terima ada di bawah. Belum terjawab? Kirim email ke{" "}
        <span className="font-semibold text-navy">halo@tifkreatif.id</span> (alamat contoh untuk MVP).
      </p>
      <div className="mt-8 max-w-3xl space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-xl border border-sand-line bg-white p-4 open:shadow-[var(--shadow-card)]">
            <summary className="cursor-pointer list-none font-bold text-navy [&::-webkit-details-marker]:hidden">{q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-navy-soft">{a}</p>
          </details>
        ))}
      </div>
      <Card className="mt-8 max-w-3xl p-5 text-sm text-navy-soft">
        Lihat juga: <Link href="/cara-kerja" className="link-quiet font-semibold">Cara Kerja</Link> ·{" "}
        <Link href="/syarat-ketentuan" className="link-quiet font-semibold">Syarat & Ketentuan</Link> ·{" "}
        <Link href="/kebijakan-privasi" className="link-quiet font-semibold">Kebijakan Privasi</Link>
      </Card>
    </div>
  );
}
