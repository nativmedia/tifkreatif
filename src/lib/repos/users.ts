import "server-only";
import { getDb, uid } from "../db";
import { hashPassword } from "../auth";
import type { ClientType, User } from "../types";

export function findUserByEmail(email: string): (User & { password_hash: string }) | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | (User & { password_hash: string })
    | undefined;
}

export function isUsernameTaken(username: string): boolean {
  return !!getDb().prepare("SELECT 1 FROM provider_profiles WHERE username = ?").get(username);
}

export function registerUser(input: {
  email: string; password: string; fullName: string; role: "client" | "provider";
  kabupaten: string; clientType?: ClientType; username?: string; headline?: string;
}): { id: string } | { error: string; field: string } {
  const db = getDb();
  if (findUserByEmail(input.email)) return { error: "Email ini sudah terdaftar. Coba masuk.", field: "email" };
  if (input.role === "provider" && input.username && isUsernameTaken(input.username))
    return { error: "Username sudah dipakai talenta lain.", field: "username" };

  const id = uid();
  const hue = Math.floor(Math.random() * 360);
  const create = db.transaction(() => {
    db.prepare("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)").run(
      id, input.email, hashPassword(input.password), input.role
    );
    db.prepare("INSERT INTO profiles (user_id, full_name, kabupaten, avatar_hue) VALUES (?, ?, ?, ?)").run(
      id, input.fullName, input.kabupaten, hue
    );
    if (input.role === "client") {
      db.prepare("INSERT INTO client_profiles (user_id, client_type) VALUES (?, ?)").run(
        id, input.clientType ?? "individu"
      );
    } else {
      db.prepare(
        "INSERT INTO provider_profiles (user_id, username, headline, service_areas) VALUES (?, ?, ?, ?)"
      ).run(id, input.username, input.headline ?? "", JSON.stringify([input.kabupaten]));
    }
  });
  create();
  return { id };
}

export function updateProfile(userId: string, data: { full_name: string; kabupaten: string; phone?: string; bio?: string }): void {
  getDb()
    .prepare(
      "UPDATE profiles SET full_name = ?, kabupaten = ?, phone = ?, bio = ?, updated_at = datetime('now') WHERE user_id = ?"
    )
    .run(data.full_name, data.kabupaten, data.phone || null, data.bio || null, userId);
}

export function updateProviderProfile(userId: string, data: {
  headline: string; response_time_hours: number; availability: string; service_areas: string[]; skills: string[];
}): void {
  const db = getDb();
  const run = db.transaction(() => {
    db.prepare(
      "UPDATE provider_profiles SET headline = ?, response_time_hours = ?, availability = ?, service_areas = ? WHERE user_id = ?"
    ).run(data.headline, data.response_time_hours, data.availability, JSON.stringify(data.service_areas), userId);
    db.prepare("DELETE FROM provider_skills WHERE provider_id = ?").run(userId);
    const ins = db.prepare("INSERT INTO provider_skills (id, provider_id, category_id) VALUES (?, ?, ?)");
    for (const c of data.skills) ins.run(uid(), userId, c);
  });
  run();
}

export function getClientProfile(userId: string): { client_type: ClientType; company_name: string | null } | undefined {
  return getDb().prepare("SELECT client_type, company_name FROM client_profiles WHERE user_id = ?").get(userId) as
    | { client_type: ClientType; company_name: string | null }
    | undefined;
}

export function getFullProfile(userId: string): { full_name: string; kabupaten: string; phone: string | null; bio: string | null } | undefined {
  return getDb().prepare("SELECT full_name, kabupaten, phone, bio FROM profiles WHERE user_id = ?").get(userId) as
    | { full_name: string; kabupaten: string; phone: string | null; bio: string | null }
    | undefined;
}

export function getProviderProfileRaw(userId: string): { headline: string; response_time_hours: number; availability: string; service_areas: string; is_verified: number; username: string } | undefined {
  return getDb().prepare("SELECT headline, response_time_hours, availability, service_areas, is_verified, username FROM provider_profiles WHERE user_id = ?").get(userId) as
    | { headline: string; response_time_hours: number; availability: string; service_areas: string; is_verified: number; username: string }
    | undefined;
}

export function getProviderSkillIds(userId: string): string[] {
  return (getDb().prepare("SELECT category_id FROM provider_skills WHERE provider_id = ?").all(userId) as { category_id: string }[]).map((r) => r.category_id);
}
