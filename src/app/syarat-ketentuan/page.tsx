import type { Metadata } from "next";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

export default function SyaratKetentuanPage() {
  return (
    <div className="container-tif py-10">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">Syarat & Ketentuan</h1>
      <p className="mt-1 text-sm text-navy-mist">Versi MVP · terakhir diperbarui 2026</p>
      <div className="mt-6 max-w-3xl space-y-5 leading-relaxed text-navy-soft">
        <section>
          <h2 className="text-lg font-extrabold text-navy">1. Peran platform</h2>
          <p className="mt-1.5">
            TIFKREATIF adalah tempat bertemunya klien dan penyedia jasa kreatif. Kontrak kerja terjadi antara
            klien dan talenta; platform memfasilitasi pencatatan brief, kesepakatan, pengerjaan, dan ulasan.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">2. Akun</h2>
          <p className="mt-1.5">
            Satu orang/badan usaha satu akun per peran. Kamu bertanggung jawab atas keamanan kata sandi dan semua
            aktivitas dari akunmu. Akun yang melanggar aturan dapat ditangguhkan oleh admin.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">3. Konten & perilaku</h2>
          <p className="mt-1.5">
            Portofolio harus karya sendiri atau karya yang berhak kamu tampilkan. Dilarang: konten menyesatkan,
            plagiarisme, ujaran kebencian, dan transaksi terlarang. Ulasan harus berdasarkan pengalaman nyata pada
            pesanan yang selesai.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">4. Pembayaran (masa MVP)</h2>
          <p className="mt-1.5">
            Pembayaran dilakukan langsung antar pihak di luar platform dan menjadi tanggung jawab masing-masing.
            Kami menyarankan kesepakatan tertulis di ruang chat pesanan. Saat sistem pembayaran resmi hadir,
            ketentuan ini akan diperbarui.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-extrabold text-navy">5. Batasan tanggung jawab</h2>
          <p className="mt-1.5">
            Platform disediakan &ldquo;sebagaimana adanya&rdquo; pada tahap MVP. Kami tidak menjamin ketersediaan tanpa henti
            dan tidak bertanggung jawab atas kerugian akibat kesepakatan di luar platform.
          </p>
        </section>
        <p className="rounded-xl bg-sand px-4 py-3 text-sm">
          Dokumen ini adalah rangka awal untuk MVP dan akan ditinjau secara hukum sebelum peluncuran komersial.
        </p>
      </div>
    </div>
  );
}
