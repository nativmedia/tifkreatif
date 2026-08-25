import { getDb, uid } from "@/lib/db";
import type { Order, Proposal } from "@/lib/types";

/** Bersihkan seluruh tabel agar tiap tes mulai dari nol (DB in-memory dibagi per proses). */
export function resetDb(): void {
  const db = getDb();
  const tables = [
    "order_activities", "reviews", "revision_requests", "deliveries", "order_milestones",
    "orders", "messages", "conversation_members", "conversations", "proposals", "projects",
    "favorites", "notifications", "reports", "verification_requests", "portfolio_items",
    "service_addons", "service_packages", "services", "provider_skills", "provider_profiles",
    "client_profiles", "profiles", "sessions", "rate_limits", "users", "categories",
  ];
  db.pragma("foreign_keys = OFF");
  for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();
  db.pragma("foreign_keys = ON");
}

export function makeUser(id: string, role: "client" | "provider" | "admin", name = id): void {
  const db = getDb();
  db.prepare("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)").run(
    id, `${id}@t.test`, "x", role
  );
  db.prepare("INSERT INTO profiles (user_id, full_name, kabupaten) VALUES (?, ?, 'Bangkalan')").run(id, name);
  if (role === "provider") {
    db.prepare(
      "INSERT INTO provider_profiles (user_id, username, headline, service_areas) VALUES (?, ?, '', '[]')"
    ).run(id, id);
  }
  if (role === "client") {
    db.prepare("INSERT INTO client_profiles (user_id, client_type) VALUES (?, 'individu')").run(id);
  }
}

export function makeCategory(id = "cat-test"): string {
  getDb()
    .prepare("INSERT INTO categories (id, name, slug) VALUES (?, 'Tes', ?)")
    .run(id, id);
  return id;
}

export function makeProject(opts: {
  id?: string; clientId: string; kind?: "open" | "direct"; target?: string | null;
  status?: string; categoryId?: string;
}): string {
  const id = opts.id ?? uid();
  getDb()
    .prepare(
      `INSERT INTO projects (id, client_id, target_provider_id, kind, title, description, category_id,
         kabupaten, work_mode, budget_min, budget_max, status)
       VALUES (?, ?, ?, ?, 'Proyek Tes', 'Deskripsi', ?, 'Bangkalan', 'remote', 0, 1000000, ?)`
    )
    .run(id, opts.clientId, opts.target ?? null, opts.kind ?? "open", opts.categoryId ?? "cat-test", opts.status ?? "open");
  return id;
}

export function makeOrder(opts: {
  id?: string; clientId: string; providerId: string; status: Order["status"];
}): Order {
  const db = getDb();
  const convId = uid();
  db.prepare("INSERT INTO conversations (id) VALUES (?)").run(convId);
  for (const m of [opts.clientId, opts.providerId]) {
    db.prepare("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)").run(convId, m);
  }
  const id = opts.id ?? uid();
  db.prepare(
    `INSERT INTO orders (id, client_id, provider_id, conversation_id, title, agreed_price, agreed_days, status)
     VALUES (?, ?, ?, ?, 'Order Tes', 500000, 7, ?)`
  ).run(id, opts.clientId, opts.providerId, convId, opts.status);
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
}

export function getProposalRow(id: string): Proposal {
  return getDb().prepare("SELECT * FROM proposals WHERE id = ?").get(id) as Proposal;
}
