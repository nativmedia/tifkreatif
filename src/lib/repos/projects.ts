import "server-only";
import { getDb, uid } from "../db";
import type { Project, ProjectCard, Proposal, ProposalWithMeta, WorkMode } from "../types";
import { createNotification } from "./messaging";

const PROJECT_BASE = `
  SELECT pj.*, c.name AS category_name, p.full_name AS client_name,
         (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = pj.id AND pr.status != 'withdrawn') AS proposal_count
    FROM projects pj
    JOIN categories c ON c.id = pj.category_id
    JOIN profiles p   ON p.user_id = pj.client_id`;

export function listOpenProjects(opts: { category?: string; kabupaten?: string; q?: string; page?: number; perPage?: number } = {}): { items: ProjectCard[]; total: number } {
  const db = getDb();
  const where = ["pj.status = 'open'", "pj.kind = 'open'"];
  const params: unknown[] = [];
  if (opts.category) { where.push("c.slug = ?"); params.push(opts.category); }
  if (opts.kabupaten) { where.push("pj.kabupaten = ?"); params.push(opts.kabupaten); }
  if (opts.q) { where.push("(pj.title LIKE ? OR pj.description LIKE ?)"); params.push(`%${opts.q}%`, `%${opts.q}%`); }
  const whereSql = "WHERE " + where.join(" AND ");
  const perPage = opts.perPage ?? 10;
  const page = Math.max(1, opts.page ?? 1);
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM projects pj JOIN categories c ON c.id = pj.category_id ${whereSql}`).get(...params) as { n: number }).n;
  const items = db
    .prepare(`${PROJECT_BASE} ${whereSql} ORDER BY pj.created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as ProjectCard[];
  return { items, total };
}

export function getProject(id: string): ProjectCard | undefined {
  return getDb().prepare(`${PROJECT_BASE} WHERE pj.id = ?`).get(id) as ProjectCard | undefined;
}

export function listClientProjects(clientId: string): ProjectCard[] {
  return getDb()
    .prepare(`${PROJECT_BASE} WHERE pj.client_id = ? ORDER BY pj.created_at DESC`)
    .all(clientId) as ProjectCard[];
}

/** Brief langsung yang ditujukan ke seorang penyedia. */
export function listDirectBriefs(providerId: string): ProjectCard[] {
  return getDb()
    .prepare(`${PROJECT_BASE} WHERE pj.kind = 'direct' AND pj.target_provider_id = ? ORDER BY pj.created_at DESC`)
    .all(providerId) as ProjectCard[];
}

export function createProject(input: {
  clientId: string; title: string; description: string; categoryId: string;
  kabupaten: string; workMode: WorkMode; budgetMin: number; budgetMax: number;
  deadline?: string | null; kind?: "open" | "direct"; targetProviderId?: string | null;
}): Project {
  const db = getDb();
  const id = uid();
  db.prepare(
    `INSERT INTO projects (id, client_id, target_provider_id, kind, title, description, category_id,
       kabupaten, work_mode, budget_min, budget_max, deadline, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`
  ).run(
    id, input.clientId, input.targetProviderId ?? null, input.kind ?? "open",
    input.title, input.description, input.categoryId, input.kabupaten,
    input.workMode, input.budgetMin, input.budgetMax, input.deadline ?? null
  );
  if (input.kind === "direct" && input.targetProviderId) {
    createNotification(input.targetProviderId, "brief", "Brief langsung masuk",
      `Kamu menerima brief baru: "${input.title}".`, "/dashboard/brief");
  }
  return getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project;
}

export function closeProject(id: string, clientId: string): boolean {
  const res = getDb()
    .prepare("UPDATE projects SET status = 'closed' WHERE id = ? AND client_id = ? AND status = 'open'")
    .run(id, clientId);
  return res.changes > 0;
}

const PROPOSAL_BASE = `
  SELECT pr.*, p.full_name AS provider_name, pp.username AS provider_username,
         p.avatar_hue AS provider_hue, pp.is_verified,
         (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.provider_id = pr.provider_id) AS rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = pr.provider_id)                AS review_count,
         pj.title AS project_title, pj.kind AS project_kind
    FROM proposals pr
    JOIN profiles p ON p.user_id = pr.provider_id
    JOIN provider_profiles pp ON pp.user_id = pr.provider_id
    JOIN projects pj ON pj.id = pr.project_id`;

export function listProjectProposals(projectId: string): ProposalWithMeta[] {
  return getDb()
    .prepare(`${PROPOSAL_BASE} WHERE pr.project_id = ? AND pr.status != 'withdrawn' ORDER BY pr.created_at DESC`)
    .all(projectId) as ProposalWithMeta[];
}

export function listProviderProposals(providerId: string): ProposalWithMeta[] {
  return getDb()
    .prepare(`${PROPOSAL_BASE} WHERE pr.provider_id = ? ORDER BY pr.created_at DESC`)
    .all(providerId) as ProposalWithMeta[];
}

export function listClientIncomingProposals(clientId: string, limit = 20): ProposalWithMeta[] {
  return getDb()
    .prepare(`${PROPOSAL_BASE} WHERE pr.client_id = ? AND pr.status = 'sent' ORDER BY pr.created_at DESC LIMIT ?`)
    .all(clientId, limit) as ProposalWithMeta[];
}

export function getProposal(id: string): Proposal | undefined {
  return getDb().prepare("SELECT * FROM proposals WHERE id = ?").get(id) as Proposal | undefined;
}

export function hasProposed(projectId: string, providerId: string): boolean {
  return !!getDb()
    .prepare("SELECT 1 FROM proposals WHERE project_id = ? AND provider_id = ?")
    .get(projectId, providerId);
}

export function createProposal(input: { projectId: string; providerId: string; message: string; price: number; estimatedDays: number }): Proposal | { error: string } {
  const db = getDb();
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(input.projectId) as Project | undefined;
  if (!project) return { error: "Proyek tidak ditemukan." };
  if (project.status !== "open") return { error: "Proyek ini sudah tidak menerima proposal." };
  if (project.kind === "direct" && project.target_provider_id !== input.providerId)
    return { error: "Brief ini ditujukan untuk penyedia lain." };
  if (project.client_id === input.providerId) return { error: "Tidak bisa mengirim proposal ke proyek sendiri." };
  if (hasProposed(input.projectId, input.providerId))
    return { error: "Kamu sudah mengirim proposal untuk proyek ini." };

  const id = uid();
  db.prepare(
    `INSERT INTO proposals (id, project_id, provider_id, client_id, message, price, estimated_days)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, input.projectId, input.providerId, project.client_id, input.message, input.price, input.estimatedDays);
  const name = (db.prepare("SELECT full_name FROM profiles WHERE user_id = ?").get(input.providerId) as { full_name: string }).full_name;
  createNotification(project.client_id, "proposal", "Proposal baru untuk proyekmu",
    `${name} mengirim penawaran untuk "${project.title}".`, `/dashboard/proyek/${project.id}`);
  return db.prepare("SELECT * FROM proposals WHERE id = ?").get(id) as Proposal;
}

export function declineProposal(id: string, clientId: string): boolean {
  const res = getDb()
    .prepare("UPDATE proposals SET status = 'declined' WHERE id = ? AND client_id = ? AND status = 'sent'")
    .run(id, clientId);
  return res.changes > 0;
}

export function withdrawProposal(id: string, providerId: string): boolean {
  const res = getDb()
    .prepare("UPDATE proposals SET status = 'withdrawn' WHERE id = ? AND provider_id = ? AND status = 'sent'")
    .run(id, providerId);
  return res.changes > 0;
}
