import "server-only";
import { getDb, uid } from "../db";
import { slugify } from "../format";
import type { PackageTier, Service, ServicePackage } from "../types";

export interface PackageInput {
  tier: PackageTier; name: string; price: number; description: string;
  deliverables: string[]; estimated_days: number; revision_count: number;
}

export function createService(providerId: string, data: {
  title: string; category_id: string; description: string;
  estimated_days: number; revision_count: number; packages: PackageInput[];
}): { id: string; slug: string } {
  const db = getDb();
  const id = uid();
  let slug = slugify(data.title);
  if (db.prepare("SELECT 1 FROM services WHERE slug = ?").get(slug)) slug = `${slug}-${id.slice(0, 6)}`;
  const run = db.transaction(() => {
    db.prepare(
      `INSERT INTO services (id, provider_id, category_id, title, slug, description, estimated_days, revision_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, providerId, data.category_id, data.title, slug, data.description, data.estimated_days, data.revision_count);
    const ins = db.prepare(
      `INSERT INTO service_packages (id, service_id, tier, name, price, description, deliverables, estimated_days, revision_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of data.packages) {
      ins.run(uid(), id, p.tier, p.name, p.price, p.description, JSON.stringify(p.deliverables), p.estimated_days, p.revision_count);
    }
  });
  run();
  return { id, slug };
}

export function updateService(serviceId: string, providerId: string, data: {
  title: string; category_id: string; description: string;
  estimated_days: number; revision_count: number; packages: PackageInput[];
}): boolean {
  const db = getDb();
  const owned = db.prepare("SELECT 1 FROM services WHERE id = ? AND provider_id = ?").get(serviceId, providerId);
  if (!owned) return false;
  const run = db.transaction(() => {
    db.prepare(
      "UPDATE services SET title = ?, category_id = ?, description = ?, estimated_days = ?, revision_count = ? WHERE id = ?"
    ).run(data.title, data.category_id, data.description, data.estimated_days, data.revision_count, serviceId);
    db.prepare("DELETE FROM service_packages WHERE service_id = ?").run(serviceId);
    const ins = db.prepare(
      `INSERT INTO service_packages (id, service_id, tier, name, price, description, deliverables, estimated_days, revision_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of data.packages) {
      ins.run(uid(), serviceId, p.tier, p.name, p.price, p.description, JSON.stringify(p.deliverables), p.estimated_days, p.revision_count);
    }
  });
  run();
  return true;
}

export function toggleOwnService(serviceId: string, providerId: string): boolean {
  return getDb().prepare("UPDATE services SET is_active = 1 - is_active WHERE id = ? AND provider_id = ?").run(serviceId, providerId).changes > 0;
}

export function getOwnService(serviceId: string, providerId: string): (Service & { packages: ServicePackage[] }) | undefined {
  const db = getDb();
  const svc = db.prepare("SELECT * FROM services WHERE id = ? AND provider_id = ?").get(serviceId, providerId) as Service | undefined;
  if (!svc) return undefined;
  const packages = db.prepare("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price").all(serviceId) as ServicePackage[];
  return { ...svc, packages };
}

export function createPortfolioItem(providerId: string, data: { title: string; description: string; category_id: string | null; year: number | null }): void {
  getDb()
    .prepare(
      "INSERT INTO portfolio_items (id, provider_id, title, description, category_id, year, cover_seed) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(uid(), providerId, data.title, data.description, data.category_id, data.year, Math.floor(Math.random() * 16) + 1);
}

export function deletePortfolioItem(id: string, providerId: string): boolean {
  return getDb().prepare("DELETE FROM portfolio_items WHERE id = ? AND provider_id = ?").run(id, providerId).changes > 0;
}
