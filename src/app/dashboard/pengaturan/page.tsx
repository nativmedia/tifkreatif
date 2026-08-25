import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileForm, ProviderProfileForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { listCategories } from "@/lib/repos/catalog";
import { getFullProfile, getProviderProfileRaw, getProviderSkillIds } from "@/lib/repos/users";
import { ALL_AREAS } from "@/lib/constants";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const user = await requireUser(undefined, "/dashboard/pengaturan");
  const profile = getFullProfile(user.id);
  if (!profile) return null;

  const providerRaw = user.role === "provider" ? getProviderProfileRaw(user.id) : undefined;
  const skills = user.role === "provider" ? getProviderSkillIds(user.id) : [];
  const categories = listCategories();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Pengaturan</h1>
        <p className="mt-1 text-sm text-navy-mist">Masuk sebagai {user.email}</p>
      </div>

      <Card className="p-6">
        <h2 className="font-extrabold text-navy">Profil dasar</h2>
        <div className="mt-4">
          <ProfileForm initial={profile} />
        </div>
      </Card>

      {user.role === "provider" && providerRaw && (
        <Card className="p-6">
          <h2 className="font-extrabold text-navy">Profil talenta</h2>
          <p className="mt-1 text-sm text-navy-mist">Informasi ini tampil di profil publik dan memengaruhi hasil pencarian.</p>
          <div className="mt-4">
            <ProviderProfileForm
              initial={{
                headline: providerRaw.headline,
                response_time_hours: providerRaw.response_time_hours,
                availability: providerRaw.availability,
                service_areas: JSON.parse(providerRaw.service_areas) as string[],
                skills,
              }}
              categories={categories}
              areas={[...ALL_AREAS]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
