import type { Metadata } from "next";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { Card, EmptyState, buttonCls } from "@/components/ui";
import { listNotifications, unreadNotificationCount } from "@/lib/repos/messaging";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function NotificationsPage() {
  const user = await requireUser(undefined, "/notifikasi");
  const notifications = listNotifications(user.id, 40);
  const unread = unreadNotificationCount(user.id);

  return (
    <div className="container-tif max-w-2xl py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Notifikasi</h1>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className={buttonCls("outline", "sm")}>Tandai semua dibaca</button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada notifikasi"
            hint="Kabar tentang proposal, pesanan, pesan, dan verifikasi akan muncul di sini."
          />
        </div>
      ) : (
        <Card className="mt-5 divide-y divide-sand-line">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link}
              className={`flex items-start gap-3 p-4 transition-colors hover:bg-sand/50 ${n.is_read ? "" : "bg-gold-tint/30"}`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  n.is_read ? "bg-sand text-navy-soft" : "bg-red-tint text-red"
                }`}
                aria-hidden="true"
              >
                <BellRing size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.is_read ? "font-semibold text-navy-soft" : "font-bold text-navy"}`}>{n.title}</p>
                <p className="mt-0.5 text-sm text-navy-mist">{n.body}</p>
                <p className="mt-1 text-xs text-navy-mist">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red" aria-label="Belum dibaca" />}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
