import type { Metadata } from "next";
import { ButtonLink, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cara Kerja",
  description: "Alur lengkap memakai TIFKREATIF untuk klien dan talenta kreatif Madura.",
};

const clientSteps = [
  ["Cari atau pasang", "Telusuri talenta dan layanan berpaket, atau pasang proyek terbuka agar talenta datang membawa proposal. Bisa juga kirim brief langsung ke talenta favoritmu."],
  ["Bandingkan & sepakati", "Tinjau proposal, portofolio, dan ulasan. Diskusikan detail lewat chat, lalu terima penawaran yang paling pas — ruang proyek otomatis terbentuk."],
  ["Pantau pengerjaan", "Ikuti milestone, kirim masukan, dan simpan semua keputusan penting di satu tempat. Tidak ada lagi kesepakatan yang hilang di chat pribadi."],
  ["Terima hasil & beri ulasan", "Setujui hasil, atau gunakan jatah revisi jika perlu. Setelah selesai, ulasanmu membantu talenta membangun reputasi."],
];

const providerSteps = [
  ["Bangun profil & layanan", "Lengkapi profil, pajang portofolio, dan buka layanan dengan paket Basic/Standard/Premium yang jelas — gratis."],
  ["Terima permintaan", "Dapatkan pesanan paket, brief langsung, atau berburu proyek terbuka dengan mengirim proposal."],
  ["Kerjakan dengan rapi", "Atur milestone, komunikasikan progres, dan kirim hasil lewat ruang proyek supaya semuanya tercatat."],
  ["Selesaikan & tumbuh", "Setiap pesanan selesai plus ulasan bagus akan mengangkat posisimu di pencarian. Ajukan verifikasi untuk lencana kepercayaan."],
];

export default function CaraKerjaPage() {
  return (
    <div className="container-tif py-10">
      <p className="eyebrow">Cara Kerja</p>
      <h1 className="mt-1 max-w-2xl text-3xl font-extrabold tracking-tight text-navy">
        Satu alur rapi untuk klien dan talenta
      </h1>
      <p className="mt-2 max-w-2xl text-navy-soft">
        TIFKREATIF menyatukan pencarian, kesepakatan, pengerjaan, dan ulasan dalam satu ruang — supaya kerja
        kreatif di Madura lebih profesional tanpa kehilangan keakraban.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="untuk-klien">
          <h2 id="untuk-klien" className="text-xl font-extrabold text-navy">
            Untuk klien
          </h2>
          <ol className="mt-4 space-y-3">
            {clientSteps.map(([t, d], i) => (
              <li key={t}>
                <Card className="flex gap-4 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-navy">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-navy-soft">{d}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
          <ButtonLink href="/talenta" className="mt-4">
            Mulai cari talenta
          </ButtonLink>
        </section>

        <section aria-labelledby="untuk-talenta">
          <h2 id="untuk-talenta" className="text-xl font-extrabold text-navy">
            Untuk talenta
          </h2>
          <ol className="mt-4 space-y-3">
            {providerSteps.map(([t, d], i) => (
              <li key={t}>
                <Card className="flex gap-4 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy font-extrabold text-gold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-navy">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-navy-soft">{d}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
          <ButtonLink href="/daftar?peran=provider" variant="secondary" className="mt-4">
            Gabung sebagai talenta
          </ButtonLink>
        </section>
      </div>

      <Card className="mt-12 border-gold bg-gold-tint/50 p-6">
        <h2 className="font-extrabold text-navy">Soal pembayaran — kami jujur</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-soft">
          Di versi MVP ini, pembayaran <strong>disepakati langsung</strong> antara klien dan talenta (transfer bank,
          tunai, atau cara lain yang kalian sepakati) dan dicatat sebagai kesepakatan di ruang proyek. Sistem
          pembayaran terlindungi (rekening bersama/escrow melalui payment gateway Indonesia) ada di peta jalan
          fase berikutnya. Sampai saat itu: sepakati harga tertulis di chat, minta uang muka wajar, dan simpan
          bukti transfer.
        </p>
      </Card>
    </div>
  );
}
