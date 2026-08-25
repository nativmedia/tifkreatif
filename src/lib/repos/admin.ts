import "server-only";
import { getDb } from "../db";
import type { Report, User, VerificationRequest } from "../types";

export function platformStats(): {
  users: number; providers: number; clients: number; services: number;
  openProjects: number; orders: number; completed: number; reviews: number;
  pendingVerifications: number; openReports: number;
} {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    users: n("SELECT COUNT(*) AS n FROM users WHERE role != 'admin'"),
    providers: n("SELECT COUNT(*) AS n FROM users WHERE role = 'provider'"),
    clients: n("SELECT COUNT(*) AS n FROM users WHERE role = 'client'"),
    services: n("SELECT COUNT(*) AS n FROM services WHERE is_active = 1"),
    openProjects: n("SELECT COUNT(*) AS n FROM projects WHERE status = 'open' AND kind = 'open'"),
    orders: n("SELECT COUNT(*) AS n FROM orders"),
    completed: n("SELECT COUNT(*) AS n FROM orders WHERE status = 'completed'"),
    reviews: n("SELECT COUNT(*) AS n FROM reviews"),
    pendingVerifications: n("SELECT COUNT(*) AS n FROM verification_requests WHERE status = 'pending'"),
    openReports: n("SELECT COUNT(*) AS n FROM reports WHERE status = 'open'"),
  };
}

export interface AdminUserRow extends User {
  full_name: string;
  kabupaten: string;
  username: string | null;
  is_verified: number | null;
}

export function listUsers(q?: string): AdminUserRow[] {
  const db = getDb();
  const like = q ? `%${q}%` : null;
  return db
    .prepare(
      `SELECT u.*, p.full_name, p.kabupaten, pp.username, pp.is_verified
         FROM users u
         JOIN profiles p ON p.user_id = u.id
         LEFT JOIN provider_profiles pp ON pp.user_id = u.id
        ${like ? "WHERE (p.full_name LIKE ? OR u.email LIKE ? OR pp.username LIKE ?)" : ""}
        ORDER BY u.created_at DESC LIMIT 100`
    )
    .all(...(like ? [like, like, like] : [])) as AdminUserRow[];
}

export function setUserActive(userId: string, active: boolean): void {
  const db = getDb();
  db.prepare("UPDATE users SET is_active = ? WHERE id = ? AND role != 'admin'").run(active ? 1 : 0, userId);
  if (!active) db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function listVerificationRequests(): VerificationRequest[] {
  return getDb()
    .prepare(
      `SELECT vr.*, p.full_name AS provider_name, pp.username AS provider_username
         FROM verification_requests vr
         JOIN profiles p ON p.user_id = vr.provider_id
         JOIN provider_profiles pp ON pp.user_id = vr.provider_id
        ORDER BY CASE vr.status WHEN 'pending' THEN 0 ELSE 1 END, vr.created_at DESC LIMIT 50`
    )
    .all() as VerificationRequest[];
}

export function listReports(): (Report & { reporter_name: string })[] {
  return getDb()
    .prepare(
      `SELECT r.*, p.full_name AS reporter_name FROM reports r
         JOIN profiles p ON p.user_id = r.reporter_id
        ORDER BY CASE r.status WHEN 'open' THEN 0 ELSE 1 END, r.created_at DESC LIMIT 100`
    )
    .all() as (Report & { reporter_name: string })[];
}

export function resolveReport(id: string, status: "resolved" | "dismissed"): void {
  getDb().prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
}

export function saveCategory(input: { id?: string; name: string; slug: string; description: string; icon: string; sort_order: number }): void {
  const db = getDb();
  if (input.id) {
    db.prepare("UPDATE categories SET name = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?").run(
      input.name, input.description, input.icon, input.sort_order, input.id
    );
  } else {
    db.prepare("INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(
      `cat-${input.slug}`, input.name, input.slug, input.description, input.icon, input.sort_order
    );
  }
}

export function toggleCategory(id: string): void {
  getDb().prepare("UPDATE categories SET is_active = 1 - is_active WHERE id = ?").run(id);
}

export function toggleServiceActive(id: string): void {
  getDb().prepare("UPDATE services SET is_active = 1 - is_active WHERE id = ?").run(id);
}

export function adminServiceList(): { id: string; title: string; is_active: number; provider_name: string; category_name: string }[] {
  return getDb()
    .prepare(
      `SELECT s.id, s.title, s.is_active, p.full_name AS provider_name, c.name AS category_name
         FROM services s JOIN profiles p ON p.user_id = s.provider_id
         JOIN categories c ON c.id = s.category_id ORDER BY s.created_at DESC LIMIT 100`
    )
    .all() as { id: string; title: string; is_active: number; provider_name: string; category_name: string }[];
}
