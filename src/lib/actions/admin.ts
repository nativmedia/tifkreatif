"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  resolveReport, saveCategory, setUserActive, toggleCategory, toggleServiceActive,
} from "@/lib/repos/admin";
import { decideVerification } from "@/lib/repos/social";
import { slugify } from "@/lib/format";
import { categorySchema, fieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function decideVerificationAction(id: string, approve: boolean): Promise<void> {
  await requireAdmin();
  decideVerification(id, approve);
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin");
  revalidatePath("/talenta");
}

export async function resolveReportAction(id: string, status: "resolved" | "dismissed"): Promise<void> {
  await requireAdmin();
  resolveReport(id, status);
  revalidatePath("/admin/laporan");
  revalidatePath("/admin");
}

export async function setUserActiveAction(userId: string, active: boolean): Promise<void> {
  await requireAdmin();
  setUserActive(userId, active);
  revalidatePath("/admin/pengguna");
}

export async function toggleServiceAdminAction(serviceId: string): Promise<void> {
  await requireAdmin();
  toggleServiceActive(serviceId);
  revalidatePath("/admin/moderasi");
  revalidatePath("/talenta");
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    sort_order: formData.get("sort_order") || 100,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const id = String(formData.get("id") ?? "") || undefined;
  saveCategory({
    id,
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description ?? "",
    icon: parsed.data.icon ?? "sparkles",
    sort_order: parsed.data.sort_order,
  });
  revalidatePath("/admin/kategori");
  return { ok: true, message: id ? "Kategori diperbarui." : "Kategori ditambahkan." };
}

export async function toggleCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  toggleCategory(id);
  revalidatePath("/admin/kategori");
}
