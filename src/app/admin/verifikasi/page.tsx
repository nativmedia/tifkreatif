import type { Metadata } from "next";
import Link from "next/link";
import { decideVerificationAction } from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/forms";
import { Badge, Card, EmptyState, buttonCls } from "@/components/ui";
import { listVerificationRequests } from "@/lib/repos/admin";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Verifikasi Talenta" };

export default function AdminVerifikasiPage() {
  const requests = listVerificationRequests();
  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Verifikasi Talenta</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Setujui hanya jika bukti karya dan identitas usahanya meyakinkan — lencana ini adalah mata uang kepercayaan platform.
      </p>

      <section className="mt-5" aria-labelledby="menunggu">
        <h2 id="menunggu" className="font-extrabold text-navy">
          Menunggu tinjauan ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Tidak ada antrean" hint="Semua permintaan verifikasi sudah ditinjau." />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-navy">
                    {r.provider_name}{" "}
                    <Link href={`/talenta/${r.provider_username}`} className="text-sm font-semibold text-red hover:underline">
                      @{r.provider_username}
                    </Link>
                  </p>
                  <p className="text-xs text-navy-mist">diajukan {timeAgo(r.created_at)}</p>
                </div>
                <p className="mt-2 whitespace-pre-line rounded-lg bg-sand/60 p-3 text-sm text-navy-soft">{r.note}</p>
                <div className="mt-3 flex gap-2">
                  <form action={decideVerificationAction.bind(null, r.id, true)}>
                    <ConfirmButton message={`Setujui verifikasi ${r.provider_name}?`} className={buttonCls("primary", "sm")}>
                      Setujui
                    </ConfirmButton>
                  </form>
                  <form action={decideVerificationAction.bind(null, r.id, false)}>
                    <ConfirmButton message={`Tolak permintaan ${r.provider_name}?`} className={buttonCls("outline", "sm")}>
                      Tolak
                    </ConfirmButton>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="mt-8" aria-labelledby="riwayat">
          <h2 id="riwayat" className="font-extrabold text-navy">
            Riwayat keputusan
          </h2>
          <Card className="mt-3 divide-y divide-sand-line">
            {decided.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 p-3.5 text-sm">
                <span className="font-semibold text-navy">{r.provider_name}</span>
                <span className="text-navy-mist">@{r.provider_username}</span>
                <span className="ml-auto">
                  <Badge tone={r.status === "approved" ? "green" : "red"}>
                    {r.status === "approved" ? "Disetujui" : "Ditolak"}
                  </Badge>
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
