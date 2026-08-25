import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/db";
import { getDelivery, getOrder, isOrderParty } from "@/lib/repos/orders";

/** Unduh lampiran delivery — hanya untuk pihak dalam pesanan terkait. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Masuk dulu untuk mengakses file." }, { status: 401 });

  const delivery = getDelivery(id);
  if (!delivery?.file_path) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  const order = getOrder(delivery.order_id);
  if (!order || (!isOrderParty(order, user.id) && user.role !== "admin")) {
    return NextResponse.json({ error: "Kamu tidak punya akses ke file ini." }, { status: 403 });
  }

  const fullPath = path.join(UPLOAD_DIR, path.basename(delivery.file_path));
  if (!fs.existsSync(fullPath)) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });

  const data = fs.readFileSync(fullPath);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": delivery.mime ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(delivery.file_name ?? "lampiran")}"`,
      "Content-Length": String(data.length),
    },
  });
}
