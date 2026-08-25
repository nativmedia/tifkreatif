import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb } from "./db";
import type { Role, SessionUser } from "./types";

const COOKIE = "tif_session";
const SESSION_DAYS = 30;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(
    token,
    userId,
    expires.toISOString()
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(token);
  jar.delete(COOKIE);
}

/** Sesi pengguna saat ini (di-cache per request). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.role, u.is_active, u.is_demo, u.created_at,
              p.full_name, p.kabupaten, p.avatar_hue,
              pp.username
         FROM sessions s
         JOIN users u    ON u.id = s.user_id
         JOIN profiles p ON p.user_id = u.id
         LEFT JOIN provider_profiles pp ON pp.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1`
    )
    .get(token) as SessionUser | undefined;
  return row ?? null;
});

export async function requireUser(role?: Role, nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/masuk${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  if (role && user.role !== role) redirect("/dashboard");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/masuk?next=%2Fadmin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
