import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Avatar, Card, EmptyState } from "@/components/ui";
import { listConversations } from "@/lib/repos/messaging";
import { timeAgo, truncate } from "@/lib/format";

export const metadata: Metadata = { title: "Pesan" };

export default async function MessagesPage() {
  const user = await requireUser(undefined, "/pesan");
  const conversations = listConversations(user.id);

  return (
    <div className="container-tif max-w-3xl py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Pesan</h1>
      <p className="mt-1 text-sm text-navy-mist">Semua percakapan terkait pesanan dan brief-mu.</p>

      {conversations.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada percakapan"
            hint="Percakapan terbentuk otomatis saat kamu memesan paket, mengirim brief yang dibalas, atau proposalmu diterima."
          />
        </div>
      ) : (
        <Card className="mt-5 divide-y divide-sand-line">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/pesan/${c.id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-sand/50"
            >
              <Avatar name={c.other_name} hue={c.other_hue} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate ${c.unread > 0 ? "font-extrabold text-navy" : "font-bold text-navy"}`}>
                    {c.other_name}
                  </p>
                  {c.last_at && <p className="shrink-0 text-xs text-navy-mist">{timeAgo(c.last_at)}</p>}
                </div>
                {c.order_title && <p className="truncate text-xs font-semibold text-navy-mist">{c.order_title}</p>}
                <p className={`truncate text-sm ${c.unread > 0 ? "font-semibold text-navy-soft" : "text-navy-mist"}`}>
                  {c.last_body ? truncate(c.last_body, 90) : "Belum ada pesan."}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red px-1.5 text-xs font-bold text-white">
                  {c.unread > 9 ? "9+" : c.unread}
                </span>
              )}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
