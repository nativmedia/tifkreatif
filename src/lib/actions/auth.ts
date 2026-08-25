"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { findUserByEmail, registerUser } from "@/lib/repos/users";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

function safeNext(raw: unknown): string {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    kabupaten: formData.get("kabupaten"),
    client_type: formData.get("client_type") || undefined,
    username: formData.get("username") || "",
    headline: formData.get("headline") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  if (!checkRateLimit(`register:${parsed.data.email}`, 5, 3600)) {
    return { ok: false, message: "Terlalu banyak percobaan. Coba lagi dalam satu jam." };
  }

  const result = registerUser({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.full_name,
    role: parsed.data.role,
    kabupaten: parsed.data.kabupaten,
    clientType: parsed.data.client_type,
    username: parsed.data.username || undefined,
    headline: parsed.data.headline,
  });
  if ("error" in result) return { ok: false, errors: { [result.field]: result.error } };

  await createSession(result.id);
  redirect(parsed.data.role === "provider" ? "/dashboard?selamat-datang=talenta" : "/dashboard?selamat-datang=klien");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  if (!checkRateLimit(`login:${parsed.data.email}`, 10, 900)) {
    return { ok: false, message: "Terlalu banyak percobaan masuk. Tunggu 15 menit, ya." };
  }

  const user = findUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { ok: false, message: "Email atau kata sandi tidak cocok." };
  }
  if (!user.is_active) {
    return { ok: false, message: "Akun ini sedang ditangguhkan. Hubungi Pusat Bantuan." };
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
