import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { deletePortfolioAction } from "@/lib/actions/services";
import { ConfirmButton } from "@/components/forms";
import { PortfolioForm } from "@/components/forms-manage";
import { PortfolioCover } from "@/components/covers";
import { Card, EmptyState } from "@/components/ui";
import { listCategories, listPortfolio } from "@/lib/repos/catalog";

export const metadata: Metadata = { title: "Portofolio" };

export default async function PortfolioPage() {
  const user = await requireUser(undefined, "/dashboard/portofolio");
  if (user.role !== "provider") redirect("/dashboard");
  const items = listPortfolio(user.id, true);
  const categories = listCategories();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Portofolio</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Karya terbaikmu adalah alasan klien memilihmu. Tambahkan minimal 3 untuk profil yang meyakinkan.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="font-extrabold text-navy">Tambah karya</h2>
          <div className="mt-3">
            <PortfolioForm categories={categories} />
          </div>
        </Card>

        <div>
          {items.length === 0 ? (
            <EmptyState title="Portofoliomu masih kosong" hint="Mulai dari karya yang paling kamu banggakan." />
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {items.map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-xl border border-sand-line bg-white">
                  <div className="aspect-[4/3]">
                    <PortfolioCover seed={item.cover_seed} label={item.title} />
                  </div>
                  <figcaption className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-bold text-navy">{item.title}</p>
                      <p className="text-xs text-navy-mist">
                        {[item.category_name, item.year].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <form action={deletePortfolioAction.bind(null, item.id)}>
                      <ConfirmButton
                        message={`Hapus "${item.title}" dari portofolio?`}
                        className="rounded-lg p-1.5 text-navy-mist hover:bg-red-tint hover:text-red"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span className="sr-only">Hapus {item.title}</span>
                      </ConfirmButton>
                    </form>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
