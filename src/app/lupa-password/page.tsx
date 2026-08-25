import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Lupa Kata Sandi" };

export default function LupaPasswordPage() {
  return (
    <div className="container-tif flex justify-center py-12">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-extrabold tracking-tight text-navy">Atur ulang kata sandi</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-soft">
          Jujur saja: fitur atur ulang kata sandi lewat email belum tersedia di versi MVP ini karena
          membutuhkan layanan pengiriman email.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-soft">
          Untuk akun demo, gunakan sandi <code className="rounded bg-sand px-1.5 py-0.5 font-mono text-xs">demo1234</code>.
          Jika kamu terkunci dari akun uji coba lain, hubungi kami lewat{" "}
          <Link href="/bantuan" className="link-quiet font-semibold">
            Pusat Bantuan
          </Link>
          .
        </p>
        <Link href="/masuk" className="mt-4 inline-block text-sm font-bold text-red hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </Card>
    </div>
  );
}
