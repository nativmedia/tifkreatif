import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ServiceForm } from "@/components/forms-manage";
import { Card } from "@/components/ui";
import { listCategories } from "@/lib/repos/catalog";
import { getOwnService } from "@/lib/repos/services-manage";

export const metadata: Metadata = { title: "Ubah Layanan" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, `/dashboard/layanan/${id}`);
  if (user.role !== "provider") redirect("/dashboard");
  const service = getOwnService(id, user.id);
  if (!service) notFound();
  const categories = listCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Ubah layanan</h1>
      <p className="mt-1 text-sm text-navy-mist">Perubahan langsung tampil di halaman publik setelah disimpan.</p>
      <Card className="mt-5 p-6">
        <ServiceForm categories={categories} service={service} />
      </Card>
    </div>
  );
}
