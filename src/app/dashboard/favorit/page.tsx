import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ProviderCard } from "@/components/cards";
import { ButtonLink, EmptyState } from "@/components/ui";
import { listFavorites } from "@/lib/repos/social";

export const metadata: Metadata = { title: "Favorit" };

export default async function FavoritPage() {
  const user = await requireUser(undefined, "/dashboard/favorit");
  if (user.role !== "client") redirect("/dashboard");
  const favorites = listFavorites(user.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Talenta Favorit</h1>
      <p className="mt-1 text-sm text-navy-mist">Simpan talenta yang menarik supaya gampang dihubungi lagi.</p>
      {favorites.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada favorit"
            hint="Tekan tombol hati di profil talenta untuk menyimpannya di sini."
            action={<ButtonLink href="/talenta" size="sm">Jelajahi talenta</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {favorites.map((p) => (
            <ProviderCard key={p.user_id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
