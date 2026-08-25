import "server-only";
import { getDb, uid } from "../db";
import { ORDER_TRANSITIONS, ORDER_STATUS_LABEL } from "../constants";
import type {
  Delivery, Milestone, Order, OrderActivity, OrderStatus, OrderWithMeta,
  Proposal, RevisionRequest, Review, ServicePackage,
} from "../types";
import { createConversation, createNotification, sendMessage } from "./messaging";

const ORDER_BASE = `
  SELECT o.*, pc.full_name AS client_name, pv.full_name AS provider_name,
         pp.username AS provider_username,
         pc.avatar_hue AS client_hue, pv.avatar_hue AS provider_hue,
         EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id) AS has_review
    FROM orders o
    JOIN profiles pc ON pc.user_id = o.client_id
    JOIN profiles pv ON pv.user_id = o.provider_id
    JOIN provider_profiles pp ON pp.user_id = o.provider_id`;

export function getOrder(id: string): OrderWithMeta | undefined {
  return getDb().prepare(`${ORDER_BASE} WHERE o.id = ?`).get(id) as OrderWithMeta | undefined;
}

export function listOrdersFor(userId: string, side: "client" | "provider"): OrderWithMeta[] {
  const col = side === "client" ? "o.client_id" : "o.provider_id";
  return getDb()
    .prepare(`${ORDER_BASE} WHERE ${col} = ? ORDER BY o.updated_at DESC`)
    .all(userId) as OrderWithMeta[];
}

export function isOrderParty(order: Order, userId: string): "client" | "provider" | null {
  if (order.client_id === userId) return "client";
  if (order.provider_id === userId) return "provider";
  return null;
}

function logActivity(orderId: string, actorId: string | null, type: string, message: string): void {
  getDb()
    .prepare("INSERT INTO order_activities (id, order_id, actor_id, type, message) VALUES (?, ?, ?, ?, ?)")
    .run(uid(), orderId, actorId, type, message);
}

function touchOrder(orderId: string): void {
  getDb().prepare("UPDATE orders SET updated_at = datetime('now') WHERE id = ?").run(orderId);
}

/** Pesan paket layanan → order berstatus 'inquiry' + percakapan awal. */
export function createOrderFromPackage(input: {
  clientId: string; pkg: ServicePackage; serviceTitle: string; providerId: string; note: string;
}): Order {
  const db = getDb();
  const run = db.transaction(() => {
    const convId = createConversation([input.clientId, input.providerId]);
    const id = uid();
    db.prepare(
      `INSERT INTO orders (id, client_id, provider_id, service_id, package_id, conversation_id,
         title, agreed_price, agreed_days, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'inquiry')`
    ).run(
      id, input.clientId, input.providerId, input.pkg.service_id, input.pkg.id, convId,
      `${input.serviceTitle} — ${input.pkg.name}`, input.pkg.price, input.pkg.estimated_days
    );
    db.prepare("UPDATE conversations SET order_id = ? WHERE id = ?").run(id, convId);
    logActivity(id, input.clientId, "created", "Pesanan dibuat dari paket layanan.");
    sendMessage(convId, input.clientId, input.note);
    return id;
  });
  const id = run();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  createNotification(input.providerId, "order", "Permintaan pesanan baru",
    `Pesanan "${order.title}" menunggu responmu.`, `/pesanan/${order.id}`);
  return order;
}

/** Klien menerima proposal → order 'accepted', proyek 'awarded', proposal lain ditolak. */
export function createOrderFromProposal(proposal: Proposal, projectTitle: string): Order {
  const db = getDb();
  const run = db.transaction(() => {
    const convId = createConversation([proposal.client_id, proposal.provider_id]);
    const id = uid();
    db.prepare(
      `INSERT INTO orders (id, client_id, provider_id, proposal_id, project_id, conversation_id,
         title, agreed_price, agreed_days, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'accepted')`
    ).run(
      id, proposal.client_id, proposal.provider_id, proposal.id, proposal.project_id, convId,
      projectTitle, proposal.price, proposal.estimated_days
    );
    db.prepare("UPDATE conversations SET order_id = ? WHERE id = ?").run(id, convId);
    db.prepare("UPDATE proposals SET status = 'accepted' WHERE id = ?").run(proposal.id);
    db.prepare("UPDATE proposals SET status = 'declined' WHERE project_id = ? AND id != ? AND status = 'sent'")
      .run(proposal.project_id, proposal.id);
    db.prepare("UPDATE projects SET status = 'awarded' WHERE id = ?").run(proposal.project_id);
    logActivity(id, proposal.client_id, "created", "Proposal diterima — kesepakatan terbentuk.");
    return id;
  });
  const id = run();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  createNotification(proposal.provider_id, "order", "Proposalmu diterima 🎉",
    `Klien menerima proposalmu untuk "${projectTitle}". Ruang proyek sudah dibuka.`, `/pesanan/${order.id}`);
  return order;
}

/** Transisi status dengan validasi peran + alur yang sah. */
export function transitionOrder(order: Order, to: OrderStatus, actorId: string): { ok: true } | { ok: false; error: string } {
  const side = isOrderParty(order, actorId);
  if (!side) return { ok: false, error: "Kamu bukan pihak dalam pesanan ini." };
  const allowed = ORDER_TRANSITIONS[order.status].find(
    (t) => t.to === to && (t.by === "both" || t.by === side)
  );
  if (!allowed) return { ok: false, error: "Perubahan status ini tidak diizinkan dari posisi saat ini." };

  const db = getDb();
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(to, order.id);
  logActivity(order.id, actorId, "status", `Status berubah: ${ORDER_STATUS_LABEL[order.status]} → ${ORDER_STATUS_LABEL[to]}.`);
  const counterpart = side === "client" ? order.provider_id : order.client_id;
  createNotification(counterpart, "order", "Status pesanan diperbarui",
    `"${order.title}" kini: ${ORDER_STATUS_LABEL[to]}.`, `/pesanan/${order.id}`);
  return { ok: true };
}

/* ── Milestone ─────────────────────────────────────────────── */

export function listMilestones(orderId: string): Milestone[] {
  return getDb()
    .prepare("SELECT * FROM order_milestones WHERE order_id = ? ORDER BY sort_order, created_at")
    .all(orderId) as Milestone[];
}

export function createMilestone(orderId: string, title: string, dueDate: string | null): void {
  const db = getDb();
  const max = (db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM order_milestones WHERE order_id = ?").get(orderId) as { m: number }).m;
  db.prepare("INSERT INTO order_milestones (id, order_id, title, due_date, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(uid(), orderId, title, dueDate, max + 1);
  logActivity(orderId, null, "milestone", `Milestone ditambahkan: ${title}.`);
  touchOrder(orderId);
}

export function setMilestoneStatus(id: string, orderId: string, status: Milestone["status"]): void {
  getDb().prepare("UPDATE order_milestones SET status = ? WHERE id = ? AND order_id = ?").run(status, id, orderId);
  touchOrder(orderId);
}

/* ── Delivery & revisi ─────────────────────────────────────── */

export function listDeliveries(orderId: string): Delivery[] {
  return getDb()
    .prepare("SELECT * FROM deliveries WHERE order_id = ? ORDER BY created_at DESC")
    .all(orderId) as Delivery[];
}

export function getDelivery(id: string): Delivery | undefined {
  return getDb().prepare("SELECT * FROM deliveries WHERE id = ?").get(id) as Delivery | undefined;
}

/** Provider mengirim hasil: buat delivery, tandai revisi terbuka selesai, status → submitted. */
export function createDelivery(order: Order, actorId: string, note: string, file: { name: string; path: string; mime: string; size: number } | null): { ok: true } | { ok: false; error: string } {
  if (order.provider_id !== actorId) return { ok: false, error: "Hanya penyedia yang bisa mengirim hasil." };
  if (!["active", "revision_requested"].includes(order.status))
    return { ok: false, error: "Hasil hanya bisa dikirim saat pesanan sedang dikerjakan." };
  const db = getDb();
  db.prepare(
    "INSERT INTO deliveries (id, order_id, note, file_name, file_path, mime, size) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(uid(), order.id, note, file?.name ?? null, file?.path ?? null, file?.mime ?? null, file?.size ?? null);
  db.prepare("UPDATE revision_requests SET status = 'resolved' WHERE order_id = ? AND status = 'open'").run(order.id);
  logActivity(order.id, actorId, "delivery", "Hasil pekerjaan dikirim.");
  return transitionOrder({ ...order }, "submitted", actorId);
}

export function listRevisions(orderId: string): RevisionRequest[] {
  return getDb()
    .prepare("SELECT * FROM revision_requests WHERE order_id = ? ORDER BY created_at DESC")
    .all(orderId) as RevisionRequest[];
}

export function createRevisionRequest(order: Order, actorId: string, message: string): { ok: true } | { ok: false; error: string } {
  if (order.client_id !== actorId) return { ok: false, error: "Hanya klien yang bisa meminta revisi." };
  if (order.status !== "submitted") return { ok: false, error: "Revisi hanya bisa diminta setelah hasil dikirim." };
  const db = getDb();
  const latest = db.prepare("SELECT id FROM deliveries WHERE order_id = ? ORDER BY created_at DESC LIMIT 1").get(order.id) as { id: string } | undefined;
  db.prepare("INSERT INTO revision_requests (id, order_id, delivery_id, message) VALUES (?, ?, ?, ?)")
    .run(uid(), order.id, latest?.id ?? null, message);
  logActivity(order.id, actorId, "revision", "Klien meminta revisi.");
  return transitionOrder(order, "revision_requested", actorId);
}

/* ── Ulasan ────────────────────────────────────────────────── */

export function createReview(order: Order, clientId: string, rating: number, comment: string): { ok: true } | { ok: false; error: string } {
  if (order.client_id !== clientId) return { ok: false, error: "Hanya klien pemilik pesanan yang bisa memberi ulasan." };
  if (order.status !== "completed") return { ok: false, error: "Ulasan hanya bisa diberikan setelah pesanan selesai." };
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM reviews WHERE order_id = ?").get(order.id);
  if (exists) return { ok: false, error: "Pesanan ini sudah kamu ulas." };
  db.prepare(
    "INSERT INTO reviews (id, order_id, client_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(uid(), order.id, clientId, order.provider_id, rating, comment);
  logActivity(order.id, clientId, "review", `Klien memberi ulasan ${rating}/5.`);
  createNotification(order.provider_id, "review", "Ulasan baru masuk",
    `Kamu mendapat ulasan ${rating}/5 untuk "${order.title}".`, `/pesanan/${order.id}`);
  return { ok: true };
}

export function getOrderReview(orderId: string): Review | undefined {
  return getDb().prepare("SELECT * FROM reviews WHERE order_id = ?").get(orderId) as Review | undefined;
}

/* ── Aktivitas ─────────────────────────────────────────────── */

export function listActivities(orderId: string): OrderActivity[] {
  return getDb()
    .prepare(
      `SELECT a.*, p.full_name AS actor_name FROM order_activities a
        LEFT JOIN profiles p ON p.user_id = a.actor_id
       WHERE a.order_id = ? ORDER BY a.created_at DESC`
    )
    .all(orderId) as OrderActivity[];
}

/* ── Statistik penyedia ────────────────────────────────────── */

export function providerStats(providerId: string): {
  activeOrders: number; completedOrders: number; incoming: number;
  rating: number | null; reviewCount: number; profileViewsHint: number;
} {
  const db = getDb();
  const q = (sql: string) => (db.prepare(sql).get(providerId) as { n: number }).n;
  const rating = db
    .prepare("SELECT ROUND(AVG(rating),1) AS r, COUNT(*) AS c FROM reviews WHERE provider_id = ?")
    .get(providerId) as { r: number | null; c: number };
  return {
    activeOrders: q("SELECT COUNT(*) AS n FROM orders WHERE provider_id = ? AND status IN ('accepted','active','submitted','revision_requested')"),
    completedOrders: q("SELECT COUNT(*) AS n FROM orders WHERE provider_id = ? AND status = 'completed'"),
    incoming: q("SELECT COUNT(*) AS n FROM orders WHERE provider_id = ? AND status IN ('inquiry','negotiation')"),
    rating: rating.r,
    reviewCount: rating.c,
    profileViewsHint: 0,
  };
}
