"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isConversationMember, markConversationRead, sendMessage } from "@/lib/repos/messaging";
import { fieldErrors, messageSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function sendMessageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const conversationId = String(formData.get("conversation_id") ?? "");
  const user = await requireUser(undefined, `/pesan/${conversationId}`);
  if (!isConversationMember(conversationId, user.id)) {
    return { ok: false, message: "Percakapan tidak ditemukan." };
  }
  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!checkRateLimit(`msg:${user.id}`, 30, 60)) {
    return { ok: false, message: "Pelan-pelan ya — terlalu banyak pesan dalam satu menit." };
  }
  sendMessage(conversationId, user.id, parsed.data.body);
  revalidatePath(`/pesan/${conversationId}`);
  revalidatePath("/pesan");
  return { ok: true };
}

export async function markReadAction(conversationId: string): Promise<void> {
  const user = await requireUser();
  if (isConversationMember(conversationId, user.id)) {
    markConversationRead(conversationId, user.id);
    revalidatePath("/pesan");
  }
}
