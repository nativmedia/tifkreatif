"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPortfolioAction, saveServiceAction } from "@/lib/actions/services";
import { saveCategoryAction } from "@/lib/actions/admin";
import { Button, Field, FormAlert, Input, Select, Textarea } from "@/components/ui";
import { TIER_LABEL } from "@/lib/constants";
import type { ActionState, Category, PackageTier, Service, ServicePackage } from "@/lib/types";

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Menyimpan…" : children}
    </Button>
  );
}

function PackageFieldset({
  tier,
  required,
  initial,
  errors,
}: {
  tier: PackageTier;
  required: boolean;
  initial?: ServicePackage;
  errors: Record<string, string> | undefined;
}) {
  const [enabled, setEnabled] = useState(required || !!initial);
  const err = (k: string) => errors?.[`pkg_${tier}_${k}`];
  const deliverables = initial ? (JSON.parse(initial.deliverables) as string[]).join("\n") : "";
  return (
    <fieldset className="rounded-xl border border-sand-line bg-white p-4">
      <legend className="px-1 text-sm font-bold text-navy">
        {required ? (
          `Paket ${TIER_LABEL[tier]} (wajib)`
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name={`pkg_${tier}_enabled`}
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="accent-red"
            />
            Aktifkan paket {TIER_LABEL[tier]}
          </label>
        )}
      </legend>
      {enabled && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Field label="Nama paket" htmlFor={`${tier}_name`} error={err("name")}>
            <Input id={`${tier}_name`} name={`pkg_${tier}_name`} defaultValue={initial?.name ?? ""} required invalid={!!err("name")} />
          </Field>
          <Field label="Harga (Rp)" htmlFor={`${tier}_price`} error={err("price")}>
            <Input id={`${tier}_price`} name={`pkg_${tier}_price`} type="number" min={10000} step={5000} defaultValue={initial?.price ?? ""} required invalid={!!err("price")} />
          </Field>
          <Field label="Deskripsi singkat" htmlFor={`${tier}_desc`} error={err("description")} className="sm:col-span-2">
            <Input id={`${tier}_desc`} name={`pkg_${tier}_description`} defaultValue={initial?.description ?? ""} maxLength={240} />
          </Field>
          <Field label="Yang didapat klien (satu per baris)" htmlFor={`${tier}_del`} error={err("deliverables")} className="sm:col-span-2">
            <Textarea id={`${tier}_del`} name={`pkg_${tier}_deliverables`} rows={3} defaultValue={deliverables} required invalid={!!err("deliverables")} placeholder={"Contoh:\n25 foto edit penuh\nFile resolusi cetak"} />
          </Field>
          <Field label="Estimasi hari" htmlFor={`${tier}_days`} error={err("estimated_days")}>
            <Input id={`${tier}_days`} name={`pkg_${tier}_days`} type="number" min={1} max={120} defaultValue={initial?.estimated_days ?? 7} required />
          </Field>
          <Field label="Jumlah revisi" htmlFor={`${tier}_rev`} error={err("revision_count")}>
            <Input id={`${tier}_rev`} name={`pkg_${tier}_revisions`} type="number" min={0} max={10} defaultValue={initial?.revision_count ?? 2} required />
          </Field>
        </div>
      )}
    </fieldset>
  );
}

export function ServiceForm({
  categories,
  service,
}: {
  categories: Category[];
  service?: Service & { packages: ServicePackage[] };
}) {
  const [state, action, pending] = useActionState(saveServiceAction, null);
  const pkg = (tier: PackageTier) => service?.packages.find((p) => p.tier === tier);
  return (
    <form action={action} className="space-y-4" noValidate>
      {service && <input type="hidden" name="service_id" value={service.id} />}
      <FormAlert state={state} />
      <Field label="Judul layanan" htmlFor="sv_title" error={state?.errors?.title} hint="Contoh: Foto Produk Katalog & Marketplace.">
        <Input id="sv_title" name="title" defaultValue={service?.title ?? ""} required invalid={!!state?.errors?.title} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Kategori" htmlFor="sv_cat" error={state?.errors?.category_id}>
          <Select id="sv_cat" name="category_id" defaultValue={service?.category_id ?? ""} required>
            <option value="" disabled>
              Pilih kategori
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estimasi umum (hari)" htmlFor="sv_days" error={state?.errors?.estimated_days}>
          <Input id="sv_days" name="estimated_days" type="number" min={1} max={120} defaultValue={service?.estimated_days ?? 7} required />
        </Field>
        <Field label="Revisi umum" htmlFor="sv_rev" error={state?.errors?.revision_count}>
          <Input id="sv_rev" name="revision_count" type="number" min={0} max={10} defaultValue={service?.revision_count ?? 2} required />
        </Field>
      </div>
      <Field label="Deskripsi layanan" htmlFor="sv_desc" error={state?.errors?.description} hint="Apa yang kamu kerjakan, prosesnya, dan untuk siapa layanan ini cocok.">
        <Textarea id="sv_desc" name="description" rows={5} defaultValue={service?.description ?? ""} required invalid={!!state?.errors?.description} />
      </Field>

      <div className="space-y-3">
        <PackageFieldset tier="basic" required initial={pkg("basic")} errors={state?.errors} />
        <PackageFieldset tier="standard" required={false} initial={pkg("standard")} errors={state?.errors} />
        <PackageFieldset tier="premium" required={false} initial={pkg("premium")} errors={state?.errors} />
      </div>

      <Submit pending={pending}>{service ? "Simpan perubahan" : "Terbitkan layanan"}</Submit>
    </form>
  );
}

export function PortfolioForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(addPortfolioAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3" noValidate>
      <FormAlert state={state} />
      <Field label="Judul karya" htmlFor="po_title" error={state?.errors?.title}>
        <Input id="po_title" name="title" required invalid={!!state?.errors?.title} />
      </Field>
      <Field label="Cerita singkat (opsional)" htmlFor="po_desc" error={state?.errors?.description}>
        <Textarea id="po_desc" name="description" rows={2} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kategori" htmlFor="po_cat">
          <Select id="po_cat" name="category_id" defaultValue="">
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tahun" htmlFor="po_year" error={state?.errors?.year}>
          <Input id="po_year" name="year" type="number" min={2000} max={2100} placeholder="2026" />
        </Field>
      </div>
      <p className="text-xs text-navy-mist">
        Di MVP ini sampul karya dibuat otomatis (ilustrasi bermotif). Unggah gambar asli hadir di fase berikutnya.
      </p>
      <Submit pending={pending}>Tambah karya</Submit>
    </form>
  );
}

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategoryAction, null);
  const key = category?.id ?? "baru";
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-end" noValidate>
      {category && <input type="hidden" name="id" value={category.id} />}
      <Field label="Nama" htmlFor={`cat_name_${key}`} error={state?.errors?.name}>
        <Input id={`cat_name_${key}`} name="name" defaultValue={category?.name ?? ""} required />
      </Field>
      <Field label="Deskripsi" htmlFor={`cat_desc_${key}`}>
        <Input id={`cat_desc_${key}`} name="description" defaultValue={category?.description ?? ""} />
      </Field>
      <Field label="Urutan" htmlFor={`cat_sort_${key}`}>
        <Input id={`cat_sort_${key}`} name="sort_order" type="number" min={0} max={999} defaultValue={category?.sort_order ?? 100} />
      </Field>
      <input type="hidden" name="icon" value={category?.icon ?? "sparkles"} />
      <Submit pending={pending}>{category ? "Simpan" : "Tambah"}</Submit>
      {state?.message && <p className={`sm:col-span-4 text-sm ${state.ok ? "text-green" : "text-red"}`}>{state.message}</p>}
    </form>
  );
}

export type { ActionState };
