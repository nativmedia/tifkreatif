import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, EmptyState, StatusBadge } from "@/components/ui";
import { listOrdersFor } from "@/lib/repos/orders";
import { formatRupiah, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Pesanan" };

export default async function OrdersPage() {
  const user = await requireUser(undefined, "/dashboard/pesanan");
  const side = user.role === "provider" ? "provider" : "client";
  const orders = listOrdersFor(user.id, side);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Pesanan</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Semua pekerjaan yang melibatkanmu — klik untuk masuk ke ruang pesanan.
      </p>
      {orders.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada pesanan"
            hint={
              side === "client"
                ? "Pesan paket layanan atau terima proposal untuk memulai pesanan pertamamu."
                : "Pesanan muncul saat klien memesan paketmu atau menerima proposalmu."
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="flex flex-wrap items-center gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <div className="min-w-0 flex-1">
                <Link href={`/pesanan/${o.id}`} className="flex flex-wrap items-center gap-2 font-bold text-navy hover:text-red">
                  {o.title}
                </Link>
                <p className="text-sm text-navy-mist">
                  {side === "client" ? `talenta: ${o.provider_name}` : `klien: ${o.client_name}`} ·{" "}
                  {formatRupiah(o.agreed_price)} · diperbarui {timeAgo(o.updated_at)}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
