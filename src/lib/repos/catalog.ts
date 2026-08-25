import "server-only";
import { getDb } from "../db";
import type {
  Category, PortfolioItem, ProviderCard, ProviderDetail, Review,
  Service, ServiceAddon, ServiceCard, ServicePackage,
} from "../types";

export function listCategories(activeOnly = true): Category[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM categories ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY sort_order, name`
    )
    .all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getDb().prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as Category | undefined;
}

/** Seed deterministik untuk cover generatif dari string. */
export function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
}

export interface ProviderFilters {
  q?: string;
  category?: string; // slug
  kabupaten?: string;
  priceMax?: number;
  ratingMin?: number;
  verified?: boolean;
  available?: boolean;
  sort?: "relevan" | "rating" | "harga" | "terbaru";
  page?: number;
  perPage?: number;
}

const PROVIDER_BASE = `
  SELECT pp.user_id, pp.username, p.full_name, pp.headline, p.kabupaten,
         pp.is_verified, u.is_demo, pp.availability, p.avatar_hue,
         pp.created_at, pp.service_areas,
         (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.provider_id = pp.user_id) AS rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = pp.user_id)                AS review_count,
         (SELECT MIN(sp.price) FROM services s JOIN service_packages sp ON sp.service_id = s.id
           WHERE s.provider_id = pp.user_id AND s.is_active = 1)                          AS starting_price
    FROM provider_profiles pp
    JOIN profiles p ON p.user_id = pp.user_id
    JOIN users u    ON u.id = pp.user_id
   WHERE u.is_active = 1`;

export function listProviders(f: ProviderFilters): { items: ProviderCard[]; total: number } {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];

  if (f.q) {
    where.push(`(full_name LIKE ? OR headline LIKE ? OR username LIKE ? OR user_id IN (
      SELECT ps.provider_id FROM provider_skills ps JOIN categories c ON c.id = ps.category_id WHERE c.name LIKE ?))`);
    const like = `%${f.q}%`;
    params.push(like, like, like, like);
  }
  if (f.category) {
    where.push(`user_id IN (SELECT ps.provider_id FROM provider_skills ps JOIN categories c ON c.id = ps.category_id WHERE c.slug = ?)`);
    params.push(f.category);
  }
  if (f.kabupaten) {
    where.push(`(kabupaten = ? OR service_areas LIKE ?)`);
    params.push(f.kabupaten, `%"${f.kabupaten}"%`);
  }
  if (f.priceMax) {
    where.push(`starting_price IS NOT NULL AND starting_price <= ?`);
    params.push(f.priceMax);
  }
  if (f.ratingMin) {
    where.push(`rating >= ?`);
    params.push(f.ratingMin);
  }
  if (f.verified) where.push(`is_verified = 1`);
  if (f.available) where.push(`availability = 'tersedia'`);

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = {
    relevan: "ORDER BY is_verified DESC, review_count DESC, rating DESC NULLS LAST, full_name",
    rating: "ORDER BY rating DESC NULLS LAST, review_count DESC",
    harga: "ORDER BY starting_price ASC NULLS LAST",
    terbaru: "ORDER BY created_at DESC",
  }[f.sort ?? "relevan"];

  const perPage = f.perPage ?? 12;
  const page = Math.max(1, f.page ?? 1);

  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM (${PROVIDER_BASE}) ${whereSql}`).get(...params) as { n: number }
  ).n;
  const rows = db
    .prepare(`SELECT * FROM (${PROVIDER_BASE}) ${whereSql} ${orderSql} LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as (ProviderCard & { service_areas: string })[];

  attachSkills(rows);
  return { items: rows, total };
}

function attachSkills(rows: (ProviderCard & { service_areas?: string })[]) {
  if (rows.length === 0) return;
  const db = getDb();
  const ids = rows.map((r) => r.user_id);
  const placeholders = ids.map(() => "?").join(",");
  const skills = db
    .prepare(
      `SELECT ps.provider_id, c.name FROM provider_skills ps
        JOIN categories c ON c.id = ps.category_id
       WHERE ps.provider_id IN (${placeholders}) ORDER BY c.sort_order`
    )
    .all(...ids) as { provider_id: string; name: string }[];
  const map = new Map<string, string[]>();
  for (const s of skills) {
    if (!map.has(s.provider_id)) map.set(s.provider_id, []);
    map.get(s.provider_id)!.push(s.name);
  }
  for (const r of rows) r.skills = map.get(r.user_id) ?? [];
}

export function featuredProviders(limit = 4): ProviderCard[] {
  return listProviders({ sort: "relevan", perPage: limit }).items;
}

export function getProviderByUsername(username: string): ProviderDetail | undefined {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM (${PROVIDER_BASE}) WHERE username = ?`)
    .get(username) as (ProviderDetail & { service_areas: string }) | undefined;
  if (!row) return undefined;
  const bio = db.prepare("SELECT bio FROM profiles WHERE user_id = ?").get(row.user_id) as { bio: string | null };
  const resp = db
    .prepare("SELECT response_time_hours FROM provider_profiles WHERE user_id = ?")
    .get(row.user_id) as { response_time_hours: number };
  attachSkills([row]);
  return {
    ...row,
    bio: bio.bio,
    response_time_hours: resp.response_time_hours,
    service_areas: JSON.parse(row.service_areas as unknown as string) as string[],
  };
}

const SERVICE_BASE = `
  SELECT s.*, c.name AS category_name,
         p.full_name AS provider_name, pp.username AS provider_username,
         pr.kabupaten AS provider_kabupaten, pp.is_verified,
         (SELECT MIN(price) FROM service_packages sp WHERE sp.service_id = s.id) AS min_price,
         (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.provider_id = s.provider_id) AS rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = s.provider_id)                AS review_count
    FROM services s
    JOIN categories c ON c.id = s.category_id
    JOIN provider_profiles pp ON pp.user_id = s.provider_id
    JOIN profiles p  ON p.user_id = s.provider_id
    JOIN profiles pr ON pr.user_id = s.provider_id`;

export function listServices(opts: { category?: string; q?: string; limit?: number; providerId?: string; includeInactive?: boolean }): ServiceCard[] {
  const db = getDb();
  const where: string[] = opts.includeInactive ? [] : ["s.is_active = 1"];
  const params: unknown[] = [];
  if (opts.category) {
    where.push("c.slug = ?");
    params.push(opts.category);
  }
  if (opts.q) {
    where.push("(s.title LIKE ? OR s.description LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.providerId) {
    where.push("s.provider_id = ?");
    params.push(opts.providerId);
  }
  const rows = db
    .prepare(
      `${SERVICE_BASE} ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY pp.is_verified DESC, review_count DESC, s.created_at DESC LIMIT ?`
    )
    .all(...params, opts.limit ?? 24) as ServiceCard[];
  for (const r of rows) r.cover_seed = seedFromString(r.slug);
  return rows;
}

export function getServiceBySlug(slug: string): (ServiceCard & { packages: ServicePackage[]; addons: ServiceAddon[] }) | undefined {
  const db = getDb();
  const row = db.prepare(`${SERVICE_BASE} WHERE s.slug = ?`).get(slug) as ServiceCard | undefined;
  if (!row) return undefined;
  row.cover_seed = seedFromString(row.slug);
  const packages = db
    .prepare("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price")
    .all(row.id) as ServicePackage[];
  const addons = db.prepare("SELECT * FROM service_addons WHERE service_id = ?").all(row.id) as ServiceAddon[];
  return { ...row, packages, addons };
}

export function getServiceById(id: string): Service | undefined {
  return getDb().prepare("SELECT * FROM services WHERE id = ?").get(id) as Service | undefined;
}

export function getPackage(id: string): ServicePackage | undefined {
  return getDb().prepare("SELECT * FROM service_packages WHERE id = ?").get(id) as ServicePackage | undefined;
}

export function listPortfolio(providerId: string, includeInactive = false): PortfolioItem[] {
  return getDb()
    .prepare(
      `SELECT pi.*, c.name AS category_name FROM portfolio_items pi
        LEFT JOIN categories c ON c.id = pi.category_id
       WHERE pi.provider_id = ? ${includeInactive ? "" : "AND pi.is_active = 1"}
       ORDER BY pi.created_at DESC`
    )
    .all(providerId) as PortfolioItem[];
}

export function listProviderReviews(providerId: string, limit = 20): Review[] {
  return getDb()
    .prepare(
      `SELECT r.*, p.full_name AS client_name, p.avatar_hue AS client_hue, o.title AS order_title
         FROM reviews r
         JOIN profiles p ON p.user_id = r.client_id
         JOIN orders o   ON o.id = r.order_id
        WHERE r.provider_id = ? ORDER BY r.created_at DESC LIMIT ?`
    )
    .all(providerId, limit) as Review[];
}
