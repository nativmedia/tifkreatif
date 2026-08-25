import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

export default function KebijakanPrivasiPage() {
  return (
    <div className="container-tif py-10">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">Kebijakan Privasi</h1>
      <p className="mt-1 text-sm text-navy-mist">Versi MVP · terakhir diperbarui 2026</p>
      <div className="prose-tif mt-6 max-w-3xl space-y-5 leading-relaxed text-navy-soft">
        <section>
          <h2 className="text-lg font-extrabold text-navy">Data yang kami kumpulkan</h2>
          <p className="mt-1.5">
            Saat mendaftar kami menyimpan nama, email, kabupaten, dan (opsional) nomor WhatsApp serta bio. Saat
            bertransaksi kami menyimpan isi brief, proposal, pesan, file hasil kerja, dan ulasan — semuanya untuk
            menjalankan fungsi platform, bukan untuk dijual.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">Bagaimana data digunakan</h2>
          <p className="mt-1.5">
            Data profil publik (nama, headline, portofolio, ulasan) ditampilkan agar klien bisa menilai talenta.
            Nomor WhatsApp tidak pernah ditampilkan publik. File hasil kerja hanya dapat diunduh oleh dua pihak
            dalam pesanan terkait (dan admin untuk penanganan sengketa).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">Keamanan</h2>
          <p className="mt-1.5">
            Kata sandi disimpan sebagai hash bcrypt dan sesi memakai cookie httpOnly. Meski begitu, versi MVP ini
            berjalan pada infrastruktur pengembangan — jangan gunakan kata sandi yang sama dengan akun pentingmu.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">Hakmu</h2>
          <p className="mt-1.5">
            Kamu bisa memperbarui profil kapan pun dari Pengaturan. Untuk penghapusan akun pada masa MVP, hubungi
            halo@tifkreatif.id (alamat contoh) dan kami proses manual.
          </p>
        </section>
        <p className="rounded-xl bg-sand px-4 py-3 text-sm">
          Catatan jujur: dokumen ini disusun untuk kebutuhan MVP dan belum ditinjau penasihat hukum. Sebelum
          peluncuran komersial, kebijakan ini akan disesuaikan dengan UU PDP.
        </p>
      </div>
    </div>
  );
}
