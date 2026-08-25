import type { Metadata } from "next";
import { toggleServiceAdminAction } from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/forms";
import { Badge, Card, EmptyState, buttonCls } from "@/components/ui";
import { adminServiceList } from "@/lib/repos/admin";

export const metadata: Metadata = { title: "Moderasi Layanan" };

export default function AdminModerasiPage() {
  const services = adminServiceList();
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">Moderasi Layanan</h1>
      <p className="mt-1 text-sm text-navy-mist">
        Nonaktifkan layanan yang melanggar aturan — layanan nonaktif hilang dari pencarian dan tidak bisa dipesan.
      </p>
      {services.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="Belum ada layanan" />
        </div>
      ) : (
        <Card className="mt-5 divide-y divide-sand-line">
          {services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{s.title}</p>
                <p className="text-sm text-navy-mist">
                  {s.provider_name} · {s.category_name}
                </p>
              </div>
              <Badge tone={s.is_active ? "green" : "red"}>{s.is_active ? "Aktif" : "Dinonaktifkan"}</Badge>
              <form action={toggleServiceAdminAction.bind(null, s.id)}>
                <ConfirmButton
                  message={s.is_active ? `Nonaktifkan "${s.title}"?` : `Aktifkan kembali "${s.title}"?`}
                  className={buttonCls(s.is_active ? "danger-ghost" : "outline", "sm")}
                >
                  {s.is_active ? "Nonaktifkan" : "Aktifkan"}
                </ConfirmButton>
              </form>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
