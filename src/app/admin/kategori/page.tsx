import type { Metadata } from "next";
import { toggleCategoryAction } from "@/lib/actions/admin";
import { CategoryForm } from "@/components/forms-manage";
import { ConfirmButton } from "@/components/forms";
import { Badge, Card, buttonCls } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { listCategories } from "@/lib/repos/catalog";

export const metadata: Metadata = { title: "Kategori" };

export default function AdminKategoriPage() {
  const categories = listCategories(false);
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Kategori</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Kategori nonaktif tidak muncul di filter dan formulir, tapi data lama tetap aman.
      </p>

      <Card className="mt-5 p-5">
        <h2 className="font-extrabold text-navy">Tambah kategori</h2>
        <div className="mt-3">
          <CategoryForm />
        </div>
      </Card>

      <div className="mt-5 space-y-3">
        {categories.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand text-navy">
                <CategoryIcon icon={c.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{c.name}</p>
                <p className="text-xs text-navy-mist">/{c.slug}</p>
              </div>
              <Badge tone={c.is_active ? "green" : "sand"}>{c.is_active ? "Aktif" : "Nonaktif"}</Badge>
              <form action={toggleCategoryAction.bind(null, c.id)}>
                <ConfirmButton
                  message={c.is_active ? `Nonaktifkan kategori ${c.name}?` : `Aktifkan kategori ${c.name}?`}
                  className={buttonCls("ghost", "sm")}
                >
                  {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                </ConfirmButton>
              </form>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-semibold text-navy-mist hover:text-navy">
                Ubah detail
              </summary>
              <div className="mt-3">
                <CategoryForm category={c} />
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
