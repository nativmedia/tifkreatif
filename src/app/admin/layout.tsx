import Link from "next/link";
import { FolderTree, Flag, LayoutDashboard, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ShieldCheck },
  { href: "/admin/laporan", label: "Laporan", icon: Flag },
  { href: "/admin/moderasi", label: "Moderasi Layanan", icon: SlidersHorizontal },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/kategori", label: "Kategori", icon: FolderTree },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-tif py-6">
      <p className="eyebrow">Panel Admin</p>
      <div className="mt-2 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Menu admin"
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
