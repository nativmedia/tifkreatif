import { beforeEach, describe, expect, it } from "vitest";
import { createProposal, getProposal, hasProposed } from "@/lib/repos/projects";
import { createOrderFromProposal } from "@/lib/repos/orders";
import { registerUser } from "@/lib/repos/users";
import { checkRateLimit } from "@/lib/rate-limit";
import { getDb, uid } from "@/lib/db";
import { getProposalRow, makeCategory, makeProject, makeUser, resetDb } from "./helpers";

const CLIENT = "klien1";
const P1 = "talenta1";
const P2 = "talenta2";

beforeEach(() => {
  resetDb();
  makeCategory();
  makeUser(CLIENT, "client", "Klien Satu");
  makeUser(P1, "provider", "Talenta Satu");
  makeUser(P2, "provider", "Talenta Dua");
});

describe("proposal", () => {
  it("tidak bisa mengirim dua kali ke proyek yang sama", () => {
    const projectId = makeProject({ clientId: CLIENT });
    const first = createProposal({ projectId, providerId: P1, message: "penawaran", price: 100000, estimatedDays: 5 });
    expect("error" in first).toBe(false);
    expect(hasProposed(projectId, P1)).toBe(true);

    const dup = createProposal({ projectId, providerId: P1, message: "lagi", price: 90000, estimatedDays: 4 });
    expect("error" in dup).toBe(true);
  });

  it("brief langsung hanya bisa dibalas talenta tujuan", () => {
    const projectId = makeProject({ clientId: CLIENT, kind: "direct", target: P1 });
    const wrong = createProposal({ projectId, providerId: P2, message: "saya mau", price: 100000, estimatedDays: 3 });
    expect("error" in wrong).toBe(true);

    const right = createProposal({ projectId, providerId: P1, message: "siap kerjakan", price: 100000, estimatedDays: 3 });
    expect("error" in right).toBe(false);
  });

  it("proyek berstatus selain open menolak proposal", () => {
    const projectId = makeProject({ clientId: CLIENT, status: "closed" });
    const res = createProposal({ projectId, providerId: P1, message: "telat", price: 100000, estimatedDays: 3 });
    expect("error" in res).toBe(true);
  });
});

describe("terima proposal → order", () => {
  it("membentuk order accepted, menolak proposal lain, dan menandai proyek awarded", () => {
    const projectId = makeProject({ clientId: CLIENT });
    const a = createProposal({ projectId, providerId: P1, message: "A", price: 100000, estimatedDays: 5 });
    const b = createProposal({ projectId, providerId: P2, message: "B", price: 120000, estimatedDays: 6 });
    if ("error" in a || "error" in b) throw new Error("setup gagal");

    const order = createOrderFromProposal(a, "Proyek Tes");
    expect(order.status).toBe("accepted");
    expect(order.proposal_id).toBe(a.id);

    expect(getProposal(a.id)?.status).toBe("accepted");
    expect(getProposalRow(b.id).status).toBe("declined");

    const project = getDb().prepare("SELECT status FROM projects WHERE id = ?").get(projectId) as { status: string };
    expect(project.status).toBe("awarded");

    const members = getDb()
      .prepare("SELECT user_id FROM conversation_members WHERE conversation_id = ?")
      .all(order.conversation_id) as { user_id: string }[];
    expect(members.map((m) => m.user_id).sort()).toEqual([CLIENT, P1].sort());
  });
});

describe("registrasi & rate limit", () => {
  it("email ganda ditolak dengan pesan ramah", () => {
    const first = registerUser({
      email: "sama@t.test", password: "rahasia123", fullName: "Uji", role: "client", kabupaten: "Bangkalan",
    });
    expect("error" in first).toBe(false);
    const dup = registerUser({
      email: "sama@t.test", password: "rahasia123", fullName: "Uji Dua", role: "client", kabupaten: "Sampang",
    });
    expect("error" in dup).toBe(true);
  });

  it("username talenta ganda ditolak", () => {
    const a = registerUser({
      email: "a@t.test", password: "rahasia123", fullName: "A", role: "provider",
      kabupaten: "Bangkalan", username: "kembar",
    });
    expect("error" in a).toBe(false);
    const b = registerUser({
      email: "b@t.test", password: "rahasia123", fullName: "B", role: "provider",
      kabupaten: "Bangkalan", username: "kembar",
    });
    expect("error" in b).toBe(true);
  });

  it("rate limit menutup setelah kuota habis dalam jendela", () => {
    const key = `uji:${uid()}`;
    expect(checkRateLimit(key, 3, 60)).toBe(true);
    expect(checkRateLimit(key, 3, 60)).toBe(true);
    expect(checkRateLimit(key, 3, 60)).toBe(true);
    expect(checkRateLimit(key, 3, 60)).toBe(false);
  });
});
