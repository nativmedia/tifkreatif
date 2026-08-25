import Link from "next/link";
import { Bell, MessageSquareText, Menu } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { totalUnreadMessages, unreadNotificationCount } from "@/lib/repos/messaging";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar, ButtonLink } from "@/components/ui";

function Logo({ variant = "navy" }: { variant?: "navy" | "white" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="TIFKREATIF — beranda">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/logo-tif-${variant}.svg`} alt="" width={30} height={26} className="h-[26px] w-auto" />
      <span className={`text-lg font-extrabold tracking-tight ${variant === "white" ? "text-bone" : "text-navy"}`}>
        TIFKREATIF
      </span>
    </Link>
  );
}

function CountDot({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-white">
      {n > 9 ? "9+" : n}
    </span>
  );
}

const navLinks = [
  { href: "/talenta", label: "Cari Talenta" },
  { href: "/proyek", label: "Proyek Terbuka" },
  { href: "/cara-kerja", label: "Cara Kerja" },
];

export async function SiteHeader() {
  const user = await getSessionUser();
  const notifCount = user ? unreadNotificationCount(user.id) : 0;
  const msgCount = user ? totalUnreadMessages(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-line bg-bone/95 backdrop-blur">
      <div className="container-tif flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-semibold text-navy-soft hover:text-red">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/pesan"
                className="relative rounded-lg p-2 text-navy-soft hover:bg-sand"
                aria-label={`Pesan${msgCount ? `, ${msgCount} belum dibaca` : ""}`}
              >
                <MessageSquareText size={20} />
                <CountDot n={msgCount} />
              </Link>
              <Link
                href="/notifikasi"
                className="relative rounded-lg p-2 text-navy-soft hover:bg-sand"
                aria-label={`Notifikasi${notifCount ? `, ${notifCount} baru` : ""}`}
              >
                <Bell size={20} />
                <CountDot n={notifCount} />
              </Link>

              <details className="group relative">
                <summary
                  className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1.5 hover:bg-sand [&::-webkit-details-marker]:hidden"
                  aria-label="Menu akun"
                >
                  <Avatar name={user.full_name} hue={user.avatar_hue} size={32} />
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-sand-line bg-white p-2 shadow-[var(--shadow-lift)]">
                  <p className="truncate px-3 py-1.5 text-sm font-bold text-navy">{user.full_name}</p>
                  <p className="truncate px-3 pb-2 text-xs text-navy-mist">{user.email}</p>
                  <div className="border-t border-sand-line pt-1.5">
                    {user.role === "admin" ? (
                      <MenuLink href="/admin">Panel Admin</MenuLink>
                    ) : (
                      <>
                        <MenuLink href="/dashboard">Dashboard</MenuLink>
                        <MenuLink href="/dashboard/pesanan">Pesanan</MenuLink>
                        {user.role === "provider" && user.username && (
                          <MenuLink href={`/talenta/${user.username}`}>Profil Publikku</MenuLink>
                        )}
                        <MenuLink href="/dashboard/pengaturan">Pengaturan</MenuLink>
                      </>
                    )}
                    <form action={logoutAction}>
                      <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red hover:bg-red-tint">
                        Keluar
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </>
          ) : (
            <>
              <ButtonLink href="/masuk" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Masuk
              </ButtonLink>
              <ButtonLink href="/daftar" size="sm">
                Daftar
              </ButtonLink>
            </>
          )}

          {/* Menu mobile */}
          <details className="relative md:hidden">
            <summary
              className="flex cursor-pointer list-none items-center rounded-lg p-2 text-navy-soft hover:bg-sand [&::-webkit-details-marker]:hidden"
              aria-label="Buka menu navigasi"
            >
              <Menu size={22} />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-sand-line bg-white p-2 shadow-[var(--shadow-lift)]">
              {navLinks.map((l) => (
                <MenuLink key={l.href} href={l.href}>
                  {l.label}
                </MenuLink>
              ))}
              {!user && <MenuLink href="/masuk">Masuk</MenuLink>}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-navy-soft hover:bg-sand">
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-bone">
      <div aria-hidden="true" className="batik-strip h-1.5" />
      <div className="dot-field">
        <div className="container-tif grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="white" />
            <p className="mt-3 max-w-xs text-sm text-bone/70">
              Temukan Talenta Kreatif Madura. Dari Bangkalan sampai Sumenep — satu tempat untuk mencari,
              menyepakati, dan menyelesaikan proyek kreatif.
            </p>
            <p className="mt-4 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-xs text-bone/80">
              Versi MVP — konten contoh diberi label “Demo”.
            </p>
          </div>
          <FooterCol
            title="Jelajah"
            links={[
              ["/talenta", "Cari Talenta"],
              ["/proyek", "Proyek Terbuka"],
              ["/daftar?peran=provider", "Gabung sebagai Talenta"],
            ]}
          />
          <FooterCol
            title="TIFKREATIF"
            links={[
              ["/tentang", "Tentang Kami"],
              ["/cara-kerja", "Cara Kerja"],
              ["/bantuan", "Pusat Bantuan"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["/kebijakan-privasi", "Kebijakan Privasi"],
              ["/syarat-ketentuan", "Syarat & Ketentuan"],
            ]}
          />
        </div>
        <div className="border-t border-white/10">
          <div className="container-tif flex flex-col items-start justify-between gap-2 py-5 text-xs text-bone/60 sm:flex-row sm:items-center">
            <p>© 2026 TIFKREATIF. Dibuat dengan bangga dari Madura.</p>
            <p>Bangkalan · Sampang · Pamekasan · Sumenep</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-bold uppercase tracking-wider text-gold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-bone/75 hover:text-bone">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
