import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar" };

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ peran?: string }> }) {
  const { peran } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const initialRole = peran === "provider" ? "provider" : "client";

  return (
    <div className="container-tif flex justify-center py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-navy">Bergabung dengan TIFKREATIF</h1>
        <p className="mt-1 text-center text-sm text-navy-mist">
          Gratis untuk klien maupun talenta — cukup satu menit.
        </p>
        <Card className="mt-6 p-6">
          <RegisterForm initialRole={initialRole} />
        </Card>
        <p className="mt-6 text-center text-sm text-navy-soft">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-red hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
