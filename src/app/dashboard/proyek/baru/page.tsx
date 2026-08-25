import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ProjectForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { listCategories } from "@/lib/repos/catalog";

export const metadata: Metadata = { title: "Pasang Proyek" };

export default async function NewProjectPage() {
  const user = await requireUser(undefined, "/dashboard/proyek/baru");
  if (user.role !== "client") redirect("/dashboard");
  const categories = listCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Pasang proyek baru</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Proyek terbuka bisa dilihat semua talenta — makin jelas brief-mu, makin bagus proposal yang datang.
      </p>
      <Card className="mt-5 p-6">
        <ProjectForm categories={categories} />
      </Card>
    </div>
  );
}
