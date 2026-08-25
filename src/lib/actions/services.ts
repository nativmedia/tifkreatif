"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  createPortfolioItem, createService, deletePortfolioItem, toggleOwnService, updateService,
  type PackageInput,
} from "@/lib/repos/services-manage";
import { fieldErrors, packageSchema, portfolioSchema, serviceSchema } from "@/lib/validation";
import type { ActionState, PackageTier } from "@/lib/types";

const TIERS: PackageTier[] = ["basic", "standard", "premium"];

function parsePackages(formData: FormData): { packages: PackageInput[]; errors: Record<string, string> } {
  const packages: PackageInput[] = [];
  const errors: Record<string, string> = {};
  for (const tier of TIERS) {
    const enabled = tier === "basic" || formData.get(`pkg_${tier}_enabled`) === "on";
    if (!enabled) continue;
    const parsed = packageSchema.safeParse({
      name: formData.get(`pkg_${tier}_name`),
      price: formData.get(`pkg_${tier}_price`),
      description: formData.get(`pkg_${tier}_description`) ?? "",
      deliverables: formData.get(`pkg_${tier}_deliverables`),
      estimated_days: formData.get(`pkg_${tier}_days`),
      revision_count: formData.get(`pkg_${tier}_revisions`),
    });
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      for (const [k, v] of Object.entries(fe)) errors[`pkg_${tier}_${k}`] = v;
      continue;
    }
    packages.push({
      tier,
      name: parsed.data.name,
      price: parsed.data.price,
      description: parsed.data.description,
      deliverables: parsed.data.deliverables.split("\n").map((s) => s.trim()).filter(Boolean),
      estimated_days: parsed.data.estimated_days,
      revision_count: parsed.data.revision_count,
    });
  }
  return { packages, errors };
}

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("provider", "/dashboard/layanan");
  const serviceId = String(formData.get("service_id") ?? "");
  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id"),
    description: formData.get("description"),
    estimated_days: formData.get("estimated_days"),
    revision_count: formData.get("revision_count"),
  });
  const { packages, errors: pkgErrors } = parsePackages(formData);
  const errors = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...pkgErrors };
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (packages.length === 0) return { ok: false, message: "Isi minimal paket Basic." };
  if (!parsed.success) return { ok: false };

  if (serviceId) {
    const ok = updateService(serviceId, user.id, { ...parsed.data, packages });
    if (!ok) return { ok: false, message: "Layanan tidak ditemukan." };
    revalidatePath("/dashboard/layanan");
    redirect("/dashboard/layanan?tersimpan=1");
  }
  createService(user.id, { ...parsed.data, packages });
  revalidatePath("/dashboard/layanan");
  redirect("/dashboard/layanan?dibuat=1");
}

export async function toggleServiceAction(serviceId: string): Promise<void> {
  const user = await requireUser("provider");
  toggleOwnService(serviceId, user.id);
  revalidatePath("/dashboard/layanan");
}

export async function addPortfolioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("provider", "/dashboard/portofolio");
  const parsed = portfolioSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category_id: formData.get("category_id") || undefined,
    year: formData.get("year") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  createPortfolioItem(user.id, {
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    category_id: parsed.data.category_id || null,
    year: parsed.data.year ?? null,
  });
  revalidatePath("/dashboard/portofolio");
  if (user.username) revalidatePath(`/talenta/${user.username}`);
  return { ok: true, message: "Karya ditambahkan ke portofolio." };
}

export async function deletePortfolioAction(itemId: string): Promise<void> {
  const user = await requireUser("provider");
  deletePortfolioItem(itemId, user.id);
  revalidatePath("/dashboard/portofolio");
  if (user.username) revalidatePath(`/talenta/${user.username}`);
}
