import "server-only";
import { getDb, uid } from "../db";
import type { ProviderCard, Report, VerificationRequest } from "../types";
import { createNotification } from "./messaging";

export function isFavorited(clientId: string, providerId: string): boolean {
  return !!getDb().prepare("SELECT 1 FROM favorites WHERE client_id = ? AND provider_id = ?").get(clientId, providerId);
}

export function toggleFavorite(clientId: string, providerId: string): boolean {
  const db = getDb();
  if (isFavorited(clientId, providerId)) {
    db.prepare("DELETE FROM favorites WHERE client_id = ? AND provider_id = ?").run(clientId, providerId);
    return false;
  }
  db.prepare("INSERT INTO favorites (id, client_id, provider_id) VALUES (?, ?, ?)").run(uid(), clientId, providerId);
  return true;
}

export function listFavorites(clientId: string): ProviderCard[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT pp.user_id, pp.username, p.full_name, pp.headline, p.kabupaten,
              pp.is_verified, u.is_demo, pp.availability, p.avatar_hue,
              (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.provider_id = pp.user_id) AS rating,
              (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = pp.user_id)               AS review_count,
              (SELECT MIN(sp.price) FROM services s JOIN service_packages sp ON sp.service_id = s.id
                WHERE s.provider_id = pp.user_id AND s.is_active = 1)                         AS starting_price
         FROM favorites f
         JOIN provider_profiles pp ON pp.user_id = f.provider_id
         JOIN profiles p ON p.user_id = pp.user_id
         JOIN users u ON u.id = pp.user_id
        WHERE f.client_id = ? ORDER BY f.created_at DESC`
    )
    .all(clientId) as ProviderCard[];
  for (const r of rows) r.skills = [];
  return rows;
}

export function createReport(reporterId: string, targetType: Report["target_type"], targetId: string, reason: string): void {
  getDb()
    .prepare("INSERT INTO reports (id, reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)")
    .run(uid(), reporterId, targetType, targetId, reason);
}

export function requestVerification(providerId: string, note: string): { ok: boolean; error?: string } {
  const db = getDb();
  const pending = db
    .prepare("SELECT 1 FROM verification_requests WHERE provider_id = ? AND status = 'pending'")
    .get(providerId);
  if (pending) return { ok: false, error: "Permintaan verifikasimu masih ditinjau." };
  const verified = db.prepare("SELECT is_verified FROM provider_profiles WHERE user_id = ?").get(providerId) as { is_verified: number };
  if (verified?.is_verified) return { ok: false, error: "Profilmu sudah terverifikasi." };
  db.prepare("INSERT INTO verification_requests (id, provider_id, note) VALUES (?, ?, ?)").run(uid(), providerId, note);
  return { ok: true };
}

export function getPendingVerification(providerId: string): VerificationRequest | undefined {
  return getDb()
    .prepare("SELECT * FROM verification_requests WHERE provider_id = ? AND status = 'pending'")
    .get(providerId) as VerificationRequest | undefined;
}

export function decideVerification(id: string, approve: boolean): void {
  const db = getDb();
  const req = db.prepare("SELECT * FROM verification_requests WHERE id = ? AND status = 'pending'").get(id) as VerificationRequest | undefined;
  if (!req) return;
  const run = db.transaction(() => {
    db.prepare("UPDATE verification_requests SET status = ?, decided_at = datetime('now') WHERE id = ?").run(
      approve ? "approved" : "rejected", id
    );
    if (approve) db.prepare("UPDATE provider_profiles SET is_verified = 1 WHERE user_id = ?").run(req.provider_id);
  });
  run();
  createNotification(
    req.provider_id, "verification",
    approve ? "Profilmu terverifikasi ✓" : "Permintaan verifikasi ditolak",
    approve
      ? "Selamat! Lencana terverifikasi kini tampil di profilmu."
      : "Lengkapi portofolio dan profilmu, lalu ajukan kembali.",
    "/dashboard"
  );
}
