import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity, CheckCircle2, Circle, CircleDashed, Download, FileArchive, MessageSquareText, Paperclip,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { changeOrderStatusAction, setMilestoneStatusAction } from "@/lib/actions/order";
import { ConfirmButton, DeliveryForm, MilestoneForm, ReviewForm, RevisionForm } from "@/components/forms";
import { ReviewItem } from "@/components/cards";
import { Avatar, Badge, Card, EmptyState, StatusBadge, buttonCls } from "@/components/ui";
import {
  getOrder, getOrderReview, isOrderParty, listActivities, listDeliveries, listMilestones, listRevisions,
} from "@/lib/repos/orders";
import { ORDER_TRANSITIONS } from "@/lib/constants";
import { formatDate, formatDateTime, formatRupiah, timeAgo } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Ruang Pesanan" };

const ACTION_LABEL: Partial<Record<OrderStatus, { label: string; variant: "primary" | "secondary" | "outline" | "danger-ghost"; confirm?: string }>> = {
  negotiation: { label: "Buka negosiasi", variant: "outline" },
  accepted: { label: "Terima pesanan", variant: "primary", confirm: "Terima pesanan ini? Kamu berkomitmen mengerjakannya sesuai kesepakatan." },
  active: { label: "Mulai pengerjaan", variant: "primary" },
  completed: { label: "Setujui & selesaikan", variant: "primary", confirm: "Setujui hasil dan tandai pesanan selesai? Setelah ini kamu bisa memberi ulasan." },
  cancelled: { label: "Batalkan pesanan", variant: "danger-ghost", confirm: "Batalkan pesanan ini? Tindakan tidak bisa diurungkan." },
};

const MILESTONE_ICON = {
  pending: CircleDashed,
  in_progress: Circle,
  done: CheckCircle2,
} as const;

export default async function OrderRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dibuat?: string; dari?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(undefined, `/pesanan/${id}`);
  const order = getOrder(id);
  if (!order) notFound();
  const side = isOrderParty(order, user.id);
  if (!side && user.role !== "admin") notFound();

  const milestones = listMilestones(id);
  const deliveries = listDeliveries(id);
  const revisions = listRevisions(id);
  const activities = listActivities(id);
  const review = getOrderReview(id);

  const availableActions = side
    ? ORDER_TRANSITIONS[order.status].filter((t) => t.by === "both" || t.by === side)
    : [];
  const counterpartName = side === "client" ? order.provider_name : order.client_name;
  const counterpartHue = side === "client" ? order.provider_hue : order.client_hue;
  const openRevision = revisions.find((r) => r.status === "open");
  const canDeliver = side === "provider" && ["active", "revision_requested"].includes(order.status);
  const canReview = side === "client" && order.status === "completed" && !review;

  return (
    <div className="container-tif py-8">
      {(sp.dibuat || sp.dari === "proposal") && (
        <p role="status" className="mb-4 rounded-xl bg-green-tint px-4 py-3 text-sm font-semibold text-green">
          {sp.dari === "proposal"
            ? "Kesepakatan terbentuk! Gunakan ruang ini untuk berdiskusi, memantau progres, dan serah terima hasil."
            : "Permintaan pesananmu terkirim. Talenta akan merespons — pantau lewat chat di ruang ini."}
        </p>
      )}

      {/* Kepala pesanan */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-navy" aria-hidden="true" />
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} />
              <Badge tone="outline">Kesepakatan langsung</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy">{order.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-mist">
              <span className="inline-flex items-center gap-2">
                <Avatar name={counterpartName} hue={counterpartHue} size={24} />
                {side === "client" ? "Talenta" : "Klien"}:{" "}
                {side === "client" ? (
                  <Link href={`/talenta/${order.provider_username}`} className="font-semibold text-navy hover:text-red">
                    {counterpartName}
                  </Link>
                ) : (
                  <span className="font-semibold text-navy">{counterpartName}</span>
                )}
              </span>
              <span>
                Nilai: <strong className="text-navy">{formatRupiah(order.agreed_price)}</strong>
              </span>
              <span>Estimasi: {order.agreed_days} hari</span>
              <span>Dibuat {timeAgo(order.created_at)}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link href={`/pesan/${order.conversation_id}`} className={buttonCls("secondary", "sm")}>
              <MessageSquareText size={15} aria-hidden="true" /> Buka chat
            </Link>
            {availableActions.map((t) => {
              const cfg = ACTION_LABEL[t.to];
              if (!cfg) return null;
              const action = changeOrderStatusAction.bind(null, order.id, t.to);
              return (
                <form key={t.to} action={action}>
                  {cfg.confirm ? (
                    <ConfirmButton message={cfg.confirm} className={buttonCls(cfg.variant, "sm")}>
                      {cfg.label}
                    </ConfirmButton>
                  ) : (
                    <button className={buttonCls(cfg.variant, "sm")}>{cfg.label}</button>
                  )}
                </form>
              );
            })}
          </div>
        </div>
        <div className="border-t border-sand-line bg-gold-tint/40 px-6 py-2.5 text-xs leading-relaxed text-[#8a6210]">
          Pembayaran versi MVP: disepakati langsung antara kedua pihak di luar platform. Tuliskan nominal, uang
          muka, dan bukti transfer di chat agar sama-sama aman.
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Kolom utama */}
        <div className="min-w-0 space-y-6">
          {/* Status inquiry helper */}
          {order.status === "inquiry" && (
            <Card className="p-5 text-sm leading-relaxed text-navy-soft">
              {side === "provider" ? (
                <>Klien baru mengajukan permintaan. Baca kebutuhannya di chat, sepakati detail (boleh lewat status <em>Negosiasi</em>), lalu tekan <strong>Terima pesanan</strong> jika sudah cocok.</>
              ) : (
                <>Permintaanmu sedang menunggu respons talenta. Sambil menunggu, lengkapi detail kebutuhanmu di chat supaya prosesnya cepat.</>
              )}
            </Card>
          )}

          {/* Revisi terbuka */}
          {openRevision && (
            <Card className="border-red bg-red-tint/30 p-5">
              <p className="font-bold text-red-deep">Permintaan revisi aktif</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-navy-soft">{openRevision.message}</p>
              <p className="mt-2 text-xs text-navy-mist">Diminta {timeAgo(openRevision.created_at)} — kirim hasil perbaikan untuk menutup revisi ini.</p>
            </Card>
          )}

          {/* Hasil kerja */}
          <section aria-labelledby="hasil">
            <h2 id="hasil" className="text-lg font-extrabold text-navy">
              Hasil kerja
            </h2>
            {deliveries.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  title="Belum ada hasil dikirim"
                  hint={side === "provider" ? "Saat pekerjaan siap ditinjau, kirimkan lewat formulir di bawah." : "Talenta akan mengirim hasil di sini saat siap ditinjau."}
                />
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {deliveries.map((d, i) => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-navy">
                        Pengiriman #{deliveries.length - i}
                      </p>
                      <p className="text-xs text-navy-mist">{formatDateTime(d.created_at)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-soft">{d.note}</p>
                    {d.file_name && (
                      <a
                        href={`/files/${d.id}`}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sand-line bg-sand/50 px-3 py-2 text-sm font-semibold text-navy hover:border-navy-mist"
                      >
                        <FileArchive size={16} aria-hidden="true" />
                        {d.file_name}
                        <Download size={14} className="text-navy-mist" aria-hidden="true" />
                      </a>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {canDeliver && (
              <Card className="mt-4 p-5">
                <p className="flex items-center gap-2 font-bold text-navy">
                  <Paperclip size={16} aria-hidden="true" /> Kirim hasil {openRevision ? "revisi" : "pekerjaan"}
                </p>
                <div className="mt-3">
                  <DeliveryForm orderId={order.id} />
                </div>
              </Card>
            )}

            {side === "client" && order.status === "submitted" && (
              <Card className="mt-4 p-5">
                <p className="font-bold text-navy">Tinjau hasil di atas</p>
                <p className="mt-1 text-sm text-navy-mist">
                  Puas? Tekan <strong>Setujui & selesaikan</strong> di bagian atas. Ada yang kurang? Minta revisi di bawah.
                </p>
                <div className="mt-3">
                  <RevisionForm orderId={order.id} />
                </div>
              </Card>
            )}
          </section>

          {/* Ulasan */}
          {order.status === "completed" && (
            <section aria-labelledby="ulasan">
              <h2 id="ulasan" className="text-lg font-extrabold text-navy">
                Ulasan
              </h2>
              {review ? (
                <Card className="mt-3 px-5">
                  <ReviewItem r={{ ...review, client_name: order.client_name, client_hue: order.client_hue, order_title: undefined }} />
                </Card>
              ) : canReview ? (
                <Card className="mt-3 p-5">
                  <p className="text-sm text-navy-mist">
                    Pesanan selesai — bantu talenta dan klien lain dengan ulasan jujurmu.
                  </p>
                  <div className="mt-3">
                    <ReviewForm orderId={order.id} />
                  </div>
                </Card>
              ) : (
                <p className="mt-3 text-sm text-navy-mist">Menunggu ulasan dari klien.</p>
              )}
            </section>
          )}
        </div>

        {/* Kolom samping */}
        <aside className="space-y-6">
          {/* Milestone */}
          <Card className="p-5">
            <h2 className="font-extrabold text-navy">Milestone</h2>
            {milestones.length === 0 ? (
              <p className="mt-2 text-sm text-navy-mist">
                {side === "provider"
                  ? "Belum ada milestone — pecah pekerjaan jadi tahapan agar klien tenang."
                  : "Talenta belum menambahkan milestone."}
              </p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {milestones.map((m) => {
                  const Icon = MILESTONE_ICON[m.status];
                  return (
                    <li key={m.id} className="flex items-start gap-2.5">
                      <Icon
                        size={18}
                        className={`mt-0.5 shrink-0 ${m.status === "done" ? "text-green" : m.status === "in_progress" ? "text-gold" : "text-navy-mist"}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${m.status === "done" ? "text-navy-mist line-through" : "text-navy"}`}>
                          {m.title}
                        </p>
                        {m.due_date && <p className="text-xs text-navy-mist">tenggat {formatDate(m.due_date)}</p>}
                        {side === "provider" && !["completed", "cancelled"].includes(order.status) && (
                          <div className="mt-1 flex gap-2 text-xs">
                            {m.status !== "in_progress" && m.status !== "done" && (
                              <form action={setMilestoneStatusAction.bind(null, order.id, m.id, "in_progress")}>
                                <button className="font-semibold text-gold hover:underline">Mulai</button>
                              </form>
                            )}
                            {m.status !== "done" && (
                              <form action={setMilestoneStatusAction.bind(null, order.id, m.id, "done")}>
                                <button className="font-semibold text-green hover:underline">Tandai selesai</button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            {side === "provider" && !["completed", "cancelled"].includes(order.status) && (
              <div className="mt-4 border-t border-sand-line pt-3">
                <MilestoneForm orderId={order.id} />
              </div>
            )}
          </Card>

          {/* Aktivitas */}
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-navy">
              <Activity size={17} aria-hidden="true" /> Aktivitas
            </h2>
            <ol className="mt-3 space-y-2.5">
              {activities.slice(0, 10).map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="text-navy-soft">{a.message}</p>
                  <p className="text-xs text-navy-mist">
                    {a.actor_name ?? "Sistem"} · {timeAgo(a.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
