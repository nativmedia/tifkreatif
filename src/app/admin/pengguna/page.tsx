import type { Metadata } from "next";
import { setUserActiveAction } from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/forms";
import { Avatar, Badge, Button, Card, EmptyState, buttonCls } from "@/components/ui";
import { listUsers } from "@/lib/repos/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Pengguna" };

const ROLE: Record<string, string> = { client: "Klien", provider: "Talenta", admin: "Admin" };

export default async function AdminPenggunaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = listUsers(q || undefined);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Pengguna</h1>
      <form className="mt-4 flex max-w-md gap-2" role="search">
        <label htmlFor="uq" className="sr-only">
          Cari pengguna
        </label>
        <input
          id="uq"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama, email, atau username…"
          className="h-10 flex-1 rounded-lg border border-sand-line bg-white px-3 text-sm"
        />
        <Button type="submit" variant="secondary" size="md">
          Cari
        </Button>
      </form>

      {users.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="Tidak ditemukan" hint="Coba kata kunci lain." />
        </div>
      ) : (
        <Card className="mt-5 divide-y divide-sand-line">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
              <Avatar name={u.full_name} hue={0} size={38} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold text-navy">
                  {u.full_name}
                  {u.is_demo === 1 && <Badge tone="outline">Demo</Badge>}
                  {u.is_verified === 1 && <Badge tone="green">Terverifikasi</Badge>}
                </p>
                <p className="text-sm text-navy-mist">
                  {u.email} · {ROLE[u.role]}
                  {u.username ? ` · @${u.username}` : ""} · sejak {formatDate(u.created_at)}
                </p>
              </div>
              <Badge tone={u.is_active ? "green" : "red"}>{u.is_active ? "Aktif" : "Ditangguhkan"}</Badge>
              {u.role !== "admin" && (
                <form action={setUserActiveAction.bind(null, u.id, !u.is_active)}>
                  <ConfirmButton
                    message={
                      u.is_active
                        ? `Tangguhkan ${u.full_name}? Ia tidak bisa masuk sampai diaktifkan lagi.`
                        : `Aktifkan kembali ${u.full_name}?`
                    }
                    className={buttonCls(u.is_active ? "danger-ghost" : "outline", "sm")}
                  >
                    {u.is_active ? "Tangguhkan" : "Aktifkan"}
                  </ConfirmButton>
                </form>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
