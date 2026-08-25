"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Star, UploadCloud } from "lucide-react";
import { loginAction, registerAction } from "@/lib/actions/auth";
import {
  createProjectAction, orderPackageAction, reportAction, sendBriefAction, sendProposalAction,
} from "@/lib/actions/marketplace";
import {
  addMilestoneAction, requestRevisionAction, sendDeliveryAction, submitReviewAction,
} from "@/lib/actions/order";
import { sendMessageAction } from "@/lib/actions/message";
import { requestVerificationAction, updateProfileAction, updateProviderProfileAction } from "@/lib/actions/profile";
import { Button, Field, FormAlert, Input, Select, Textarea } from "@/components/ui";
import { CLIENT_TYPE_LABEL, KABUPATEN, WORK_MODE_LABEL } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { Category } from "@/lib/types";

/* ── Helper umum ───────────────────────────────────────────── */

function SubmitButton({ children, pending, ...rest }: React.ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...rest}>
      {pending ? "Memproses…" : children}
    </Button>
  );
}

export function ConfirmButton({
  message,
  className = "",
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}

/* ── Auth ──────────────────────────────────────────────────── */

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FormAlert state={state} />
      <Field label="Email" htmlFor="email" error={state?.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state?.errors?.email} placeholder="nama@email.com" />
      </Field>
      <Field label="Kata sandi" htmlFor="password" error={state?.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required invalid={!!state?.errors?.password} placeholder="••••••••" />
      </Field>
      <SubmitButton pending={pending} className="w-full" size="lg">
        Masuk
      </SubmitButton>
    </form>
  );
}

export function RegisterForm({ initialRole }: { initialRole: "client" | "provider" }) {
  const [state, action, pending] = useActionState(registerAction, null);
  const [role, setRole] = useState<"client" | "provider">(initialRole);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />

      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-navy">Aku ingin</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["client", "Mencari jasa kreatif", "Pesan layanan atau pasang proyek"],
              ["provider", "Menawarkan jasa", "Buka layanan dan terima proyek"],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border-2 p-3 transition-colors ${
                role === value ? "border-red bg-red-tint/50" : "border-sand-line bg-white hover:border-navy-mist"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              <p className="text-sm font-bold text-navy">{title}</p>
              <p className="mt-0.5 text-xs text-navy-mist">{sub}</p>
            </label>
          ))}
        </div>
        {state?.errors?.role && <p className="mt-1 text-sm text-red">{state.errors.role}</p>}
      </fieldset>

      <Field label="Nama lengkap" htmlFor="full_name" error={state?.errors?.full_name}>
        <Input id="full_name" name="full_name" required invalid={!!state?.errors?.full_name} placeholder="Nama sesuai identitas atau nama studio" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="r_email" error={state?.errors?.email}>
          <Input id="r_email" name="email" type="email" autoComplete="email" required invalid={!!state?.errors?.email} placeholder="nama@email.com" />
        </Field>
        <Field label="Kata sandi" htmlFor="r_password" error={state?.errors?.password} hint="Minimal 8 karakter.">
          <Input id="r_password" name="password" type="password" autoComplete="new-password" required minLength={8} invalid={!!state?.errors?.password} />
        </Field>
      </div>

      <Field label="Kabupaten domisili" htmlFor="kabupaten" error={state?.errors?.kabupaten}>
        <Select id="kabupaten" name="kabupaten" required defaultValue="Bangkalan">
          {KABUPATEN.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </Select>
      </Field>

      {role === "client" ? (
        <Field label="Kamu mendaftar sebagai" htmlFor="client_type">
          <Select id="client_type" name="client_type" defaultValue="individu">
            {Object.entries(CLIENT_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <Field
            label="Username publik"
            htmlFor="username"
            error={state?.errors?.username}
            hint="Jadi alamat profilmu: tifkreatif.id/talenta/username"
          >
            <Input id="username" name="username" invalid={!!state?.errors?.username} placeholder="mis. rofiqivisual" />
          </Field>
          <Field label="Headline singkat" htmlFor="headline" error={state?.errors?.headline} hint="Contoh: Fotografer wedding di Bangkalan.">
            <Input id="headline" name="headline" maxLength={90} placeholder="Apa keahlian utamamu?" />
          </Field>
        </>
      )}

      <SubmitButton pending={pending} className="w-full" size="lg">
        Buat akun
      </SubmitButton>
      <p className="text-center text-xs text-navy-mist">
        Dengan mendaftar kamu menyetujui Syarat & Ketentuan serta Kebijakan Privasi TIFKREATIF.
      </p>
    </form>
  );
}

/* ── Proyek & brief ────────────────────────────────────────── */

export function ProjectForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createProjectAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <Field label="Judul proyek" htmlFor="title" error={state?.errors?.title} hint="Contoh: Foto katalog 40 artikel batik tulis.">
        <Input id="title" name="title" required invalid={!!state?.errors?.title} />
      </Field>
      <Field label="Ceritakan kebutuhanmu" htmlFor="description" error={state?.errors?.description} hint="Latar belakang, hasil yang diharapkan, referensi jika ada.">
        <Textarea id="description" name="description" rows={6} required invalid={!!state?.errors?.description} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori" htmlFor="category_id" error={state?.errors?.category_id}>
          <Select id="category_id" name="category_id" required defaultValue="">
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
        <Field label="Lokasi (kabupaten)" htmlFor="p_kabupaten" error={state?.errors?.kabupaten}>
          <Select id="p_kabupaten" name="kabupaten" required defaultValue="Bangkalan">
            {KABUPATEN.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cara kerja" htmlFor="work_mode" error={state?.errors?.work_mode}>
          <Select id="work_mode" name="work_mode" defaultValue="remote">
            {Object.entries(WORK_MODE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tenggat (opsional)" htmlFor="deadline">
          <Input id="deadline" name="deadline" type="date" />
        </Field>
        <Field label="Budget minimal (Rp)" htmlFor="budget_min" error={state?.errors?.budget_min}>
          <Input id="budget_min" name="budget_min" type="number" min={0} step={50000} placeholder="0" invalid={!!state?.errors?.budget_min} />
        </Field>
        <Field label="Budget maksimal (Rp)" htmlFor="budget_max" error={state?.errors?.budget_max}>
          <Input id="budget_max" name="budget_max" type="number" min={10000} step={50000} required placeholder="1000000" invalid={!!state?.errors?.budget_max} />
        </Field>
      </div>
      <SubmitButton pending={pending}>Pasang proyek</SubmitButton>
    </form>
  );
}

export function BriefForm({
  providerId,
  providerUsername,
  providerName,
  categories,
}: {
  providerId: string;
  providerUsername: string;
  providerName: string;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState(sendBriefAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="provider_username" value={providerUsername} />
      <FormAlert state={state} />
      <Field label="Judul kebutuhan" htmlFor="b_title" error={state?.errors?.title}>
        <Input id="b_title" name="title" required invalid={!!state?.errors?.title} placeholder="Contoh: Prewedding di Pantai Lombang" />
      </Field>
      <Field
        label={`Ceritakan kebutuhanmu ke ${providerName}`}
        htmlFor="b_desc"
        error={state?.errors?.description}
        hint="Konsep, tanggal penting, referensi — makin jelas makin cepat direspons."
      >
        <Textarea id="b_desc" name="description" rows={5} required invalid={!!state?.errors?.description} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori" htmlFor="b_cat" error={state?.errors?.category_id}>
          <Select id="b_cat" name="category_id" required defaultValue="">
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
        <Field label="Cara kerja" htmlFor="b_mode">
          <Select id="b_mode" name="work_mode" defaultValue="remote">
            {Object.entries(WORK_MODE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Perkiraan budget (Rp)" htmlFor="b_budget" error={state?.errors?.budget_max}>
          <Input id="b_budget" name="budget_max" type="number" min={10000} step={50000} required invalid={!!state?.errors?.budget_max} placeholder="1500000" />
        </Field>
        <Field label="Tenggat (opsional)" htmlFor="b_deadline">
          <Input id="b_deadline" name="deadline" type="date" />
        </Field>
      </div>
      <SubmitButton pending={pending}>Kirim brief</SubmitButton>
    </form>
  );
}

export function ProposalForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(sendProposalAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="project_id" value={projectId} />
      <FormAlert state={state} />
      <Field
        label="Pendekatanmu"
        htmlFor="pr_message"
        error={state?.errors?.message}
        hint="Jelaskan cara kerjamu, apa yang termasuk, dan kenapa kamu cocok."
      >
        <Textarea id="pr_message" name="message" rows={6} required invalid={!!state?.errors?.message} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Penawaran harga (Rp)" htmlFor="pr_price" error={state?.errors?.price}>
          <Input id="pr_price" name="price" type="number" min={10000} step={50000} required invalid={!!state?.errors?.price} />
        </Field>
        <Field label="Estimasi pengerjaan (hari)" htmlFor="pr_days" error={state?.errors?.estimated_days}>
          <Input id="pr_days" name="estimated_days" type="number" min={1} max={180} required invalid={!!state?.errors?.estimated_days} />
        </Field>
      </div>
      <SubmitButton pending={pending}>Kirim proposal</SubmitButton>
    </form>
  );
}

export function OrderPackageForm({
  packageId,
  serviceSlug,
  packageName,
  price,
}: {
  packageId: string;
  serviceSlug: string;
  packageName: string;
  price: number;
}) {
  const [state, action, pending] = useActionState(orderPackageAction, null);
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="package_id" value={packageId} />
      <input type="hidden" name="service_slug" value={serviceSlug} />
      <FormAlert state={state} />
      <Field
        label={`Catatan untuk paket ${packageName}`}
        htmlFor={`note-${packageId}`}
        error={state?.errors?.note}
        hint="Ceritakan kebutuhan dan tanggal pentingmu."
      >
        <Textarea id={`note-${packageId}`} name="note" rows={3} required invalid={!!state?.errors?.note} />
      </Field>
      <SubmitButton pending={pending} className="w-full">
        Ajukan pesanan · {formatRupiah(price)}
      </SubmitButton>
      <p className="text-xs text-navy-mist">
        Belum ada pembayaran di tahap ini — penyedia akan merespons dulu, lalu kalian sepakati detailnya.
      </p>
    </form>
  );
}

/* ── Ruang proyek ──────────────────────────────────────────── */

export function DeliveryForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(sendDeliveryAction, null);
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="order_id" value={orderId} />
      <FormAlert state={state} />
      <Field label="Catatan hasil" htmlFor="d_note" error={state?.errors?.note} hint="Apa yang dikirim, cara mengakses, dan hal yang perlu dicek klien.">
        <Textarea id="d_note" name="note" rows={4} required invalid={!!state?.errors?.note} />
      </Field>
      <Field label="Lampiran (opsional)" htmlFor="d_file" error={state?.errors?.file} hint="PNG, JPG, WebP, PDF, atau ZIP — maks. 8 MB.">
        <Input id="d_file" name="file" type="file" accept=".png,.jpg,.jpeg,.webp,.pdf,.zip" className="pt-1.5" invalid={!!state?.errors?.file} />
      </Field>
      <SubmitButton pending={pending}>
        <UploadCloud size={16} aria-hidden="true" /> Kirim hasil ke klien
      </SubmitButton>
    </form>
  );
}

export function RevisionForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(requestRevisionAction, null);
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="order_id" value={orderId} />
      <FormAlert state={state} />
      <Field label="Bagian yang perlu direvisi" htmlFor="rv_message" error={state?.errors?.message} hint="Sebutkan spesifik: file mana, bagian apa, jadi seperti apa.">
        <Textarea id="rv_message" name="message" rows={4} required invalid={!!state?.errors?.message} />
      </Field>
      <SubmitButton pending={pending} variant="outline">
        Minta revisi
      </SubmitButton>
    </form>
  );
}

export function MilestoneForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(addMilestoneAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-2" noValidate>
      <input type="hidden" name="order_id" value={orderId} />
      <div className="min-w-40 flex-1">
        <label htmlFor="ms_title" className="mb-1.5 block text-sm font-semibold text-navy">
          Milestone baru
        </label>
        <Input id="ms_title" name="title" placeholder="mis. Draf pertama" required invalid={!!state?.errors?.title} />
      </div>
      <div>
        <label htmlFor="ms_due" className="mb-1.5 block text-sm font-semibold text-navy">
          Tenggat
        </label>
        <Input id="ms_due" name="due_date" type="date" />
      </div>
      <SubmitButton pending={pending} variant="outline">
        Tambah
      </SubmitButton>
      {(state?.errors?.title || state?.message) && (
        <p className="w-full text-sm text-red">{state?.errors?.title ?? state?.message}</p>
      )}
    </form>
  );
}

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <FormAlert state={state} />
      <div>
        <p className="mb-1.5 text-sm font-semibold text-navy">Penilaianmu</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating 1 sampai 5 bintang">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} bintang`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5"
            >
              <Star
                size={26}
                className={(hover || rating) >= n ? "fill-gold text-gold" : "text-sand-line"}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {state?.errors?.rating && <p className="mt-1 text-sm text-red">{state.errors.rating}</p>}
      </div>
      <Field label="Ceritakan pengalamanmu" htmlFor="rev_comment" error={state?.errors?.comment}>
        <Textarea id="rev_comment" name="comment" rows={4} required invalid={!!state?.errors?.comment} />
      </Field>
      <SubmitButton pending={pending}>Kirim ulasan</SubmitButton>
    </form>
  );
}

/* ── Chat ──────────────────────────────────────────────────── */

export function ChatComposer({ conversationId }: { conversationId: string }) {
  const [state, action, pending] = useActionState(sendMessageAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="flex items-end gap-2" noValidate>
      <input type="hidden" name="conversation_id" value={conversationId} />
      <div className="flex-1">
        <label htmlFor="chat_body" className="sr-only">
          Tulis pesan
        </label>
        <Textarea id="chat_body" name="body" rows={2} required placeholder="Tulis pesan…" invalid={!!state?.errors?.body} />
        {(state?.errors?.body || (!state?.ok && state?.message)) && (
          <p className="mt-1 text-sm text-red">{state?.errors?.body ?? state?.message}</p>
        )}
      </div>
      <Button type="submit" disabled={pending} aria-label="Kirim pesan" className="h-[52px] w-[52px] p-0">
        <Send size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}

/* ── Laporan & verifikasi ──────────────────────────────────── */

export function ReportForm({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [state, action, pending] = useActionState(reportAction, null);
  if (state?.ok) return <FormAlert state={state} />;
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <FormAlert state={state} />
      <Field label="Alasan laporan" htmlFor={`report-${targetId}`} error={state?.errors?.reason}>
        <Textarea id={`report-${targetId}`} name="reason" rows={3} required invalid={!!state?.errors?.reason} placeholder="Jelaskan apa yang melanggar aturan…" />
      </Field>
      <SubmitButton pending={pending} variant="outline" size="sm">
        Kirim laporan
      </SubmitButton>
    </form>
  );
}

export function VerificationForm() {
  const [state, action, pending] = useActionState(requestVerificationAction, null);
  if (state?.ok) return <FormAlert state={state} />;
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert state={state} />
      <Field
        label="Bukti pendukung"
        htmlFor="verif_note"
        error={state?.errors?.note}
        hint="Tautan portofolio/akun media sosial karya, atau identitas usaha."
      >
        <Textarea id="verif_note" name="note" rows={3} required invalid={!!state?.errors?.note} />
      </Field>
      <SubmitButton pending={pending} variant="gold" size="sm">
        Ajukan verifikasi
      </SubmitButton>
    </form>
  );
}

/* ── Profil ────────────────────────────────────────────────── */

export function ProfileForm({
  initial,
}: {
  initial: { full_name: string; kabupaten: string; phone: string | null; bio: string | null };
}) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="pf_name" error={state?.errors?.full_name}>
          <Input id="pf_name" name="full_name" defaultValue={initial.full_name} required invalid={!!state?.errors?.full_name} />
        </Field>
        <Field label="Kabupaten" htmlFor="pf_kab" error={state?.errors?.kabupaten}>
          <Select id="pf_kab" name="kabupaten" defaultValue={initial.kabupaten}>
            {KABUPATEN.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Nomor WhatsApp (opsional)" htmlFor="pf_phone" error={state?.errors?.phone} hint="Hanya dibagikan ke pihak yang sedang bertransaksi denganmu.">
        <Input id="pf_phone" name="phone" defaultValue={initial.phone ?? ""} placeholder="08xxxxxxxxxx" invalid={!!state?.errors?.phone} />
      </Field>
      <Field label="Tentang kamu" htmlFor="pf_bio" error={state?.errors?.bio}>
        <Textarea id="pf_bio" name="bio" rows={4} defaultValue={initial.bio ?? ""} invalid={!!state?.errors?.bio} />
      </Field>
      <SubmitButton pending={pending}>Simpan profil</SubmitButton>
    </form>
  );
}

export function ProviderProfileForm({
  initial,
  categories,
  areas,
}: {
  initial: {
    headline: string;
    response_time_hours: number;
    availability: string;
    service_areas: string[];
    skills: string[];
  };
  categories: Category[];
  areas: string[];
}) {
  const [state, action, pending] = useActionState(updateProviderProfileAction, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <Field label="Headline profil" htmlFor="pp_headline" error={state?.errors?.headline}>
        <Input id="pp_headline" name="headline" defaultValue={initial.headline} maxLength={90} required invalid={!!state?.errors?.headline} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rata-rata waktu respons (jam)" htmlFor="pp_resp" error={state?.errors?.response_time_hours}>
          <Input id="pp_resp" name="response_time_hours" type="number" min={1} max={72} defaultValue={initial.response_time_hours} />
        </Field>
        <Field label="Ketersediaan" htmlFor="pp_avail">
          <Select id="pp_avail" name="availability" defaultValue={initial.availability}>
            <option value="tersedia">Tersedia menerima pekerjaan</option>
            <option value="sibuk">Sedang sibuk (antrean)</option>
            <option value="libur">Sedang libur</option>
          </Select>
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-navy">Area layanan</legend>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <label key={a} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-line bg-white px-3 py-1.5 text-sm has-checked:border-red has-checked:bg-red-tint/40">
              <input type="checkbox" name="service_areas" value={a} defaultChecked={initial.service_areas.includes(a)} className="accent-red" />
              {a}
            </label>
          ))}
        </div>
        {state?.errors?.service_areas && <p className="mt-1 text-sm text-red">{state.errors.service_areas}</p>}
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-navy">Kategori keahlian (maks. 6)</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label key={c.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-line bg-white px-3 py-1.5 text-sm has-checked:border-red has-checked:bg-red-tint/40">
              <input type="checkbox" name="skills" value={c.id} defaultChecked={initial.skills.includes(c.id)} className="accent-red" />
              {c.name}
            </label>
          ))}
        </div>
        {state?.errors?.skills && <p className="mt-1 text-sm text-red">{state.errors.skills}</p>}
      </fieldset>
      <SubmitButton pending={pending}>Simpan profil talenta</SubmitButton>
    </form>
  );
}
