"use server";

import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { requireUser } from "@/lib/auth";
import { UPLOAD_DIR, uid } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createDelivery, createMilestone, createReview, createRevisionRequest,
  getOrder, isOrderParty, setMilestoneStatus, transitionOrder,
} from "@/lib/repos/orders";
import {
  ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, deliverySchema, fieldErrors,
  milestoneSchema, revisionSchema, reviewSchema,
} from "@/lib/validation";
import type { ActionState, MilestoneStatus, OrderStatus } from "@/lib/types";

async function requireOrderParty(orderId: string) {
  const user = await requireUser(undefined, `/pesanan/${orderId}`);
  const order = getOrder(orderId);
  if (!order || !isOrderParty(order, user.id)) {
    return { user, order: undefined } as const;
  }
  return { user, order } as const;
}

export async function changeOrderStatusAction(orderId: string, to: OrderStatus): Promise<void> {
  const { user, order } = await requireOrderParty(orderId);
  if (!order) return;
  transitionOrder(order, to, user.id);
  revalidatePath(`/pesanan/${orderId}`);
  revalidatePath("/dashboard/pesanan");
}

export async function addMilestoneAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("order_id") ?? "");
  const { user, order } = await requireOrderParty(orderId);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  if (order.provider_id !== user.id) return { ok: false, message: "Hanya penyedia yang bisa menambah milestone." };
  if (["completed", "cancelled"].includes(order.status))
    return { ok: false, message: "Pesanan sudah berakhir." };
  const parsed = milestoneSchema.safeParse({
    title: formData.get("title"),
    due_date: formData.get("due_date") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  createMilestone(orderId, parsed.data.title, parsed.data.due_date || null);
  revalidatePath(`/pesanan/${orderId}`);
  return { ok: true };
}

export async function setMilestoneStatusAction(orderId: string, milestoneId: string, status: MilestoneStatus): Promise<void> {
  const { user, order } = await requireOrderParty(orderId);
  if (!order || order.provider_id !== user.id) return;
  setMilestoneStatus(milestoneId, orderId, status);
  revalidatePath(`/pesanan/${orderId}`);
}

export async function sendDeliveryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("order_id") ?? "");
  const { user, order } = await requireOrderParty(orderId);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  const parsed = deliverySchema.safeParse({ note: formData.get("note") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  let stored: { name: string; path: string; mime: string; size: number } | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
      return { ok: false, errors: { file: "Format tidak didukung. Gunakan PNG, JPG, WebP, PDF, atau ZIP." } };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { ok: false, errors: { file: "Ukuran file maksimal 8 MB." } };
    }
    const ext = path.extname(file.name).slice(0, 10) || "";
    const storedName = `${uid()}${ext}`;
    const fullPath = path.join(UPLOAD_DIR, storedName);
    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(fullPath, bytes);
    stored = { name: file.name, path: storedName, mime: file.type, size: file.size };
  }

  const result = createDelivery(order, user.id, parsed.data.note, stored);
  revalidatePath(`/pesanan/${orderId}`);
  if (!result.ok) return { ok: false, message: result.error };
  return { ok: true, message: "Hasil terkirim. Klien akan meninjau dan menyetujui atau meminta revisi." };
}

export async function requestRevisionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("order_id") ?? "");
  const { user, order } = await requireOrderParty(orderId);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  const parsed = revisionSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const result = createRevisionRequest(order, user.id, parsed.data.message);
  revalidatePath(`/pesanan/${orderId}`);
  if (!result.ok) return { ok: false, message: result.error };
  return { ok: true };
}

export async function submitReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("order_id") ?? "");
  const { user, order } = await requireOrderParty(orderId);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!checkRateLimit(`review:${user.id}`, 10, 3600)) {
    return { ok: false, message: "Terlalu banyak ulasan dalam satu jam." };
  }
  const result = createReview(order, user.id, parsed.data.rating, parsed.data.comment);
  revalidatePath(`/pesanan/${orderId}`);
  revalidatePath(`/talenta/${order.provider_username}`);
  if (!result.ok) return { ok: false, message: result.error };
  return { ok: true, message: "Terima kasih! Ulasanmu membantu talenta dan klien lain." };
}
