import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { PortfolioCover } from "@/components/covers";

export default function NotFound() {
  return (
    <div className="container-tif flex flex-col items-center py-20 text-center">
      <div className="h-40 w-56 overflow-hidden rounded-2xl border border-sand-line" aria-hidden="true">
        <PortfolioCover seed={404 % 997} label="Halaman tidak ditemukan" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-navy">Halaman ini belum ada di peta kami</h1>
      <p className="mt-2 max-w-md text-navy-soft">
        Tautannya mungkin salah ketik, atau halamannya sudah dipindah. Yuk kembali menjelajah talenta Madura.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Ke beranda</ButtonLink>
        <ButtonLink href="/talenta" variant="outline">
          Cari talenta
        </ButtonLink>
      </div>
      <p className="mt-4 text-sm text-navy-mist">
        Butuh bantuan? Kunjungi{" "}
        <Link href="/bantuan" className="link-quiet font-semibold">
          Pusat Bantuan
        </Link>
        .
      </p>
    </div>
  );
}
