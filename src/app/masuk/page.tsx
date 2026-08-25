import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function MasukPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <div className="container-tif flex justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-navy">Selamat datang kembali</h1>
        <p className="mt-1 text-center text-sm text-navy-mist">Masuk untuk melanjutkan aktivitasmu.</p>
        <Card className="mt-6 p-6">
          <LoginForm next={next} />
          <p className="mt-4 text-center text-sm text-navy-mist">
            <Link href="/lupa-password" className="link-quiet">
              Lupa kata sandi?
            </Link>
          </p>
        </Card>

        <Card className="mt-4 border-gold bg-gold-tint/60 p-4">
          <p className="text-sm font-bold text-navy">Coba dengan akun demo (sandi: demo1234)</p>
          <ul className="mt-2 space-y-1 text-sm text-navy-soft">
            <li><span className="font-semibold">Klien:</span> klien@demo.tifkreatif.id</li>
            <li><span className="font-semibold">Talenta:</span> talenta@demo.tifkreatif.id</li>
            <li><span className="font-semibold">Admin:</span> admin@demo.tifkreatif.id</li>
          </ul>
        </Card>

        <p className="mt-6 text-center text-sm text-navy-soft">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-bold text-red hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
