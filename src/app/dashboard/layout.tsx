import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase, FolderKanban, Heart, Inbox, LayoutDashboard, Package, Send, Settings, Images,
} from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(undefined, "/dashboard");
  if (user.role === "admin") redirect("/admin");

  const links =
    user.role === "client"
      ? [
          { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
          { href: "/dashboard/proyek", label: "Proyek Saya", icon: FolderKanban },
          { href: "/dashboard/pesanan", label: "Pesanan", icon: Briefcase },
          { href: "/dashboard/favorit", label: "Favorit", icon: Heart },
          { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
        ]
      : [
          { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
          { href: "/dashboard/brief", label: "Brief Masuk", icon: Inbox },
          { href: "/dashboard/proposal", label: "Proposal Saya", icon: Send },
          { href: "/dashboard/pesanan", label: "Pesanan", icon: Briefcase },
          { href: "/dashboard/layanan", label: "Layanan", icon: Package },
          { href: "/dashboard/portofolio", label: "Portofolio", icon: Images },
          { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
        ];

  return (
    <div className="container-tif py-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Menu dashboard"
          className="scroll-slim -mx-4 flex gap-1 overflow-x-auto border-b border-sand-line px-4 pb-2 lg:mx-0 lg:flex-col lg:border-b-0 lg:px-0 lg:pb-0"
        >
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-soft hover:bg-sand hover:text-navy"
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
