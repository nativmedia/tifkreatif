"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/repos/messaging";

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser(undefined, "/notifikasi");
  markAllNotificationsRead(user.id);
  revalidatePath("/notifikasi");
  revalidatePath("/", "layout");
}
