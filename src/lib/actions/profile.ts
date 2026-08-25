"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateProfile, updateProviderProfile } from "@/lib/repos/users";
import { requestVerification } from "@/lib/repos/social";
import { fieldErrors, profileSchema, providerProfileSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(undefined, "/dashboard/pengaturan");
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    kabupaten: formData.get("kabupaten"),
    phone: formData.get("phone") || "",
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  updateProfile(user.id, parsed.data);
  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/", "layout");
  return { ok: true, message: "Profil tersimpan." };
}

export async function updateProviderProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("provider", "/dashboard/pengaturan");
  const parsed = providerProfileSchema.safeParse({
    headline: formData.get("headline"),
    response_time_hours: formData.get("response_time_hours"),
    availability: formData.get("availability"),
    service_areas: formData.getAll("service_areas").map(String),
    skills: formData.getAll("skills").map(String),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  updateProviderProfile(user.id, parsed.data);
  revalidatePath("/dashboard/pengaturan");
  if (user.username) revalidatePath(`/talenta/${user.username}`);
  return { ok: true, message: "Profil talenta tersimpan." };
}

export async function requestVerificationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("provider", "/dashboard");
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 20) {
    return { ok: false, errors: { note: "Ceritakan singkat bukti karya/identitas usahamu (min. 20 karakter)." } };
  }
  const result = requestVerification(user.id, note);
  revalidatePath("/dashboard");
  if (!result.ok) return { ok: false, message: result.error };
  return { ok: true, message: "Permintaan verifikasi terkirim. Tim kami akan meninjau dalam 1–3 hari kerja." };
}
