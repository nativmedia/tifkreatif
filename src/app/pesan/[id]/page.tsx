import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { AutoRefresh, ChatComposer } from "@/components/forms";
import { Avatar, ButtonLink, Card } from "@/components/ui";
import {
  getConversationMeta, isConversationMember, listMessages, markConversationRead,
} from "@/lib/repos/messaging";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Percakapan" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, `/pesan/${id}`);
  if (!isConversationMember(id, user.id)) notFound();

  const meta = getConversationMeta(id, user.id);
  if (!meta) notFound();
  const messages = listMessages(id);
  markConversationRead(id, user.id);

  return (
    <div className="container-tif max-w-3xl py-6">
      <AutoRefresh intervalMs={5000} />
      <div className="flex items-center gap-3">
        <Link href="/pesan" className="rounded-lg p-2 text-navy-soft hover:bg-sand" aria-label="Kembali ke daftar pesan">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold text-navy">{meta.other_name}</h1>
          {meta.order_title && <p className="truncate text-xs text-navy-mist">{meta.order_title}</p>}
        </div>
        {meta.order_id && (
          <ButtonLink href={`/pesanan/${meta.order_id}`} variant="outline" size="sm">
            <Briefcase size={15} aria-hidden="true" /> Ruang pesanan
          </ButtonLink>
        )}
      </div>

      <Card className="mt-4 flex h-[60svh] flex-col">
        <div className="scroll-slim flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite" aria-label="Riwayat pesan">
          {messages.length === 0 ? (
            <p className="m-auto text-sm text-navy-mist">Belum ada pesan — mulai percakapannya!</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex max-w-[85%] gap-2 ${mine ? "self-end flex-row-reverse" : "self-start"}`}>
                  {!mine && <Avatar name={m.sender_name} hue={m.sender_hue} size={30} className="mt-1" />}
                  <div>
                    <div
                      className={`whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        mine ? "rounded-br-md bg-navy text-bone" : "rounded-bl-md bg-sand text-navy"
                      }`}
                    >
                      {m.body}
                    </div>
                    <p className={`mt-0.5 text-[11px] text-navy-mist ${mine ? "text-right" : ""}`}>
                      {formatDateTime(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-sand-line p-3">
          <ChatComposer conversationId={id} />
          <p className="mt-1.5 text-[11px] text-navy-mist">
            Pesan diperbarui otomatis beberapa detik sekali. Jaga kesepakatan penting tetap tertulis di sini.
          </p>
        </div>
      </Card>
    </div>
  );
}
