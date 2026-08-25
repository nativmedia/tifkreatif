import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ServiceForm } from "@/components/forms-manage";
import { Card } from "@/components/ui";
import { listCategories } from "@/lib/repos/catalog";

export const metadata: Metadata = { title: "Layanan Baru" };

export default async function NewServicePage() {
  const user = await requireUser(undefined, "/dashboard/layanan/baru");
  if (user.role !== "provider") redirect("/dashboard");
  const categories = listCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Buka layanan baru</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Paket Basic wajib diisi; Standard dan Premium opsional. Harga jelas membuat klien lebih cepat memesan.
      </p>
      <Card className="mt-5 p-6">
        <ServiceForm categories={categories} />
      </Card>
    </div>
  );
}
