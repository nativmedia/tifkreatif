"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPackage, getServiceById } from "@/lib/repos/catalog";
import {
  closeProject, createProject, createProposal, declineProposal, getProject,
  getProposal, withdrawProposal,
} from "@/lib/repos/projects";
import { createOrderFromPackage, createOrderFromProposal } from "@/lib/repos/orders";
import { createReport, toggleFavorite } from "@/lib/repos/social";
import {
  briefSchema, fieldErrors, messageSchema, projectSchema, proposalSchema, reportSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function toggleFavoriteAction(providerId: string, path: string): Promise<void> {
  const user = await requireUser("client", path);
  toggleFavorite(user.id, providerId);
  revalidatePath(path);
  revalidatePath("/dashboard/favorit");
}

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("client", "/dashboard/proyek/baru");
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    kabupaten: formData.get("kabupaten"),
    work_mode: formData.get("work_mode"),
    budget_min: formData.get("budget_min") || 0,
    budget_max: formData.get("budget_max"),
    deadline: formData.get("deadline") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!checkRateLimit(`project:${user.id}`, 10, 3600)) {
    return { ok: false, message: "Kamu membuat terlalu banyak proyek dalam satu jam. Coba lagi nanti." };
  }
  const project = createProject({
    clientId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    categoryId: parsed.data.category_id,
    kabupaten: parsed.data.kabupaten,
    workMode: parsed.data.work_mode,
    budgetMin: parsed.data.budget_min,
    budgetMax: parsed.data.budget_max,
    deadline: parsed.data.deadline || null,
  });
  revalidatePath("/proyek");
  redirect(`/dashboard/proyek/${project.id}?dibuat=1`);
}

/** Brief langsung dari halaman profil talenta. */
export async function sendBriefAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const targetProviderId = String(formData.get("provider_id") ?? "");
  const username = String(formData.get("provider_username") ?? "");
  const user = await requireUser("client", username ? `/talenta/${username}` : "/talenta");
  const parsed = briefSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    work_mode: formData.get("work_mode"),
    budget_max: formData.get("budget_max"),
    deadline: formData.get("deadline") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!targetProviderId) return { ok: false, message: "Penyedia tujuan tidak ditemukan." };
  if (!checkRateLimit(`brief:${user.id}`, 10, 3600)) {
    return { ok: false, message: "Terlalu banyak brief dalam satu jam. Coba lagi nanti." };
  }
  createProject({
    clientId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    categoryId: parsed.data.category_id,
    kabupaten: user.kabupaten,
    workMode: parsed.data.work_mode,
    budgetMin: 0,
    budgetMax: parsed.data.budget_max,
    deadline: parsed.data.deadline || null,
    kind: "direct",
    targetProviderId,
  });
  redirect(`/talenta/${username}?brief=terkirim`);
}

export async function closeProjectAction(projectId: string): Promise<void> {
  const user = await requireUser("client");
  closeProject(projectId, user.id);
  revalidatePath("/dashboard/proyek");
  revalidatePath(`/dashboard/proyek/${projectId}`);
  revalidatePath("/proyek");
}

export async function sendProposalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = String(formData.get("project_id") ?? "");
  const user = await requireUser("provider", projectId ? `/proyek/${projectId}` : "/proyek");
  const parsed = proposalSchema.safeParse({
    message: formData.get("message"),
    price: formData.get("price"),
    estimated_days: formData.get("estimated_days"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!checkRateLimit(`proposal:${user.id}`, 20, 3600)) {
    return { ok: false, message: "Terlalu banyak proposal dalam satu jam. Coba lagi nanti." };
  }
  const result = createProposal({
    projectId,
    providerId: user.id,
    message: parsed.data.message,
    price: parsed.data.price,
    estimatedDays: parsed.data.estimated_days,
  });
  if ("error" in result) return { ok: false, message: result.error };
  revalidatePath(`/proyek/${projectId}`);
  redirect(`/dashboard/proposal?terkirim=1`);
}

export async function acceptProposalAction(proposalId: string): Promise<void> {
  const user = await requireUser("client");
  const proposal = getProposal(proposalId);
  if (!proposal || proposal.client_id !== user.id || proposal.status !== "sent") {
    redirect("/dashboard/proyek?galat=proposal");
  }
  const project = getProject(proposal.project_id);
  const order = createOrderFromProposal(proposal, project?.title ?? "Proyek");
  redirect(`/pesanan/${order.id}?dari=proposal`);
}

export async function declineProposalAction(proposalId: string, projectId: string): Promise<void> {
  const user = await requireUser("client");
  declineProposal(proposalId, user.id);
  revalidatePath(`/dashboard/proyek/${projectId}`);
}

export async function withdrawProposalAction(proposalId: string): Promise<void> {
  const user = await requireUser("provider");
  withdrawProposal(proposalId, user.id);
  revalidatePath("/dashboard/proposal");
}

/** Pesan paket layanan → order inquiry + chat pembuka. */
export async function orderPackageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const packageId = String(formData.get("package_id") ?? "");
  const slug = String(formData.get("service_slug") ?? "");
  const user = await requireUser("client", slug ? `/layanan/${slug}` : "/talenta");
  const parsed = messageSchema.safeParse({ body: formData.get("note") });
  if (!parsed.success) return { ok: false, errors: { note: "Tulis kebutuhanmu singkat saja — minimal 1 kalimat." } };
  const pkg = getPackage(packageId);
  const service = pkg ? getServiceById(pkg.service_id) : undefined;
  if (!pkg || !service || !service.is_active) return { ok: false, message: "Paket tidak ditemukan atau layanan nonaktif." };
  if (service.provider_id === user.id) return { ok: false, message: "Tidak bisa memesan layanan sendiri." };
  if (!checkRateLimit(`order:${user.id}`, 10, 3600)) {
    return { ok: false, message: "Terlalu banyak permintaan pesanan dalam satu jam. Coba lagi nanti." };
  }
  const order = createOrderFromPackage({
    clientId: user.id,
    pkg,
    serviceTitle: service.title,
    providerId: service.provider_id,
    note: parsed.data.body,
  });
  redirect(`/pesanan/${order.id}?dibuat=1`);
}

export async function reportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(undefined, "/");
  const parsed = reportSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!checkRateLimit(`report:${user.id}`, 5, 3600)) {
    return { ok: false, message: "Terlalu banyak laporan dalam satu jam. Coba lagi nanti." };
  }
  createReport(user.id, parsed.data.target_type, parsed.data.target_id, parsed.data.reason);
  return { ok: true, message: "Laporan terkirim. Tim kami akan meninjaunya — terima kasih sudah menjaga TIFKREATIF." };
}
