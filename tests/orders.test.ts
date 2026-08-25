import { beforeEach, describe, expect, it } from "vitest";
import {
  createDelivery, createReview, createRevisionRequest, getOrder, listRevisions, transitionOrder,
} from "@/lib/repos/orders";
import { getDb } from "@/lib/db";
import { makeOrder, makeUser, resetDb } from "./helpers";

const CLIENT = "klien1";
const PROVIDER = "talenta1";
const OUTSIDER = "orang-lain";

beforeEach(() => {
  resetDb();
  makeUser(CLIENT, "client", "Klien Satu");
  makeUser(PROVIDER, "provider", "Talenta Satu");
  makeUser(OUTSIDER, "client", "Orang Lain");
});

describe("transisi status pesanan", () => {
  it("penyedia bisa menerima inquiry, klien tidak", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "inquiry" });
    expect(transitionOrder(order, "accepted", CLIENT).ok).toBe(false);
    expect(transitionOrder(order, "accepted", PROVIDER).ok).toBe(true);
    expect(getOrder(order.id)?.status).toBe("accepted");
  });

  it("hanya klien yang bisa menyelesaikan pesanan submitted", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "submitted" });
    expect(transitionOrder(order, "completed", PROVIDER).ok).toBe(false);
    expect(transitionOrder(order, "completed", CLIENT).ok).toBe(true);
    expect(getOrder(order.id)?.status).toBe("completed");
  });

  it("lompatan status tidak sah ditolak", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "active" });
    expect(transitionOrder(order, "completed", CLIENT).ok).toBe(false);
    expect(getOrder(order.id)?.status).toBe("active");
  });

  it("pihak luar tidak bisa mengubah status", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "inquiry" });
    const result = transitionOrder(order, "cancelled", OUTSIDER);
    expect(result.ok).toBe(false);
  });

  it("kedua pihak bisa membatalkan dari accepted", () => {
    const a = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "accepted" });
    expect(transitionOrder(a, "cancelled", CLIENT).ok).toBe(true);
    const b = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "accepted" });
    expect(transitionOrder(b, "cancelled", PROVIDER).ok).toBe(true);
  });
});

describe("delivery & revisi", () => {
  it("hanya penyedia yang bisa mengirim hasil, dan hanya saat active/revision_requested", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "active" });
    expect(createDelivery(order, CLIENT, "hasil", null).ok).toBe(false);

    const wrongStatus = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "inquiry" });
    expect(createDelivery(wrongStatus, PROVIDER, "hasil", null).ok).toBe(false);

    expect(createDelivery(order, PROVIDER, "hasil final", null).ok).toBe(true);
    expect(getOrder(order.id)?.status).toBe("submitted");
  });

  it("revisi hanya oleh klien saat submitted; delivery ulang menutup revisi", () => {
    const order = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "active" });
    createDelivery(order, PROVIDER, "v1", null);
    const submitted = getOrder(order.id)!;

    expect(createRevisionRequest(submitted, PROVIDER, "revisi").ok).toBe(false);
    expect(createRevisionRequest(submitted, CLIENT, "tolong ganti warna").ok).toBe(true);
    expect(getOrder(order.id)?.status).toBe("revision_requested");
    expect(listRevisions(order.id)[0].status).toBe("open");

    createDelivery(getOrder(order.id)!, PROVIDER, "v2 sudah diganti", null);
    expect(getOrder(order.id)?.status).toBe("submitted");
    expect(listRevisions(order.id).every((r) => r.status === "resolved")).toBe(true);
  });
});

describe("ulasan", () => {
  it("hanya untuk pesanan completed, hanya oleh klien, dan unik per pesanan", () => {
    const active = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "active" });
    expect(createReview(active, CLIENT, 5, "bagus").ok).toBe(false);

    const done = makeOrder({ clientId: CLIENT, providerId: PROVIDER, status: "completed" });
    expect(createReview(done, PROVIDER, 5, "bagus").ok).toBe(false);
    expect(createReview(done, CLIENT, 5, "kerja rapi dan tepat waktu").ok).toBe(true);
    expect(createReview(done, CLIENT, 4, "duplikat").ok).toBe(false);

    const count = (getDb().prepare("SELECT COUNT(*) AS n FROM reviews").get() as { n: number }).n;
    expect(count).toBe(1);
  });
});
