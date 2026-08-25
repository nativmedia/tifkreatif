import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Star } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/constants";
import { initials } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

/* ── Button ────────────────────────────────────────────────── */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const btnVariants = {
  primary: "bg-red text-white hover:bg-red-deep",
  secondary: "bg-navy text-bone hover:bg-navy-soft",
  gold: "bg-gold text-navy hover:brightness-95",
  outline: "border border-sand-line bg-white text-navy hover:border-navy-mist",
  ghost: "text-navy hover:bg-sand",
  "danger-ghost": "text-red hover:bg-red-tint",
} as const;
const btnSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonVariant = keyof typeof btnVariants;

export function buttonCls(variant: ButtonVariant = "primary", size: keyof typeof btnSizes = "md", extra = ""): string {
  return `${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: keyof typeof btnSizes }) {
  return <button className={buttonCls(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: keyof typeof btnSizes }) {
  return <Link className={buttonCls(variant, size, className)} {...props} />;
}

/* ── Form controls ─────────────────────────────────────────── */

const controlBase =
  "w-full rounded-lg border bg-white px-3 text-navy placeholder:text-navy-mist/60 disabled:bg-sand/50";

export function Input({ className = "", invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={`${controlBase} h-10 ${invalid ? "border-red" : "border-sand-line"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({ className = "", invalid, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={`${controlBase} py-2 ${invalid ? "border-red" : "border-sand-line"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className = "", invalid, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select
      className={`${controlBase} h-10 ${invalid ? "border-red" : "border-sand-line"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-navy-mist">{hint}</p>}
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}

export function FormAlert({ state }: { state: { ok: boolean; message?: string } | null }) {
  if (!state?.message) return null;
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        state.ok ? "bg-green-tint text-green" : "bg-red-tint text-red-deep"
      }`}
    >
      {state.message}
    </p>
  );
}

/* ── Surfaces ──────────────────────────────────────────────── */

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-[0.875rem] border border-sand-line bg-white shadow-[var(--shadow-card)] ${className}`}
      {...props}
    />
  );
}

const badgeTones = {
  sand: "bg-sand text-navy-soft",
  gold: "bg-gold-tint text-[#8a6210]",
  navy: "bg-navy text-bone",
  red: "bg-red-tint text-red-deep",
  green: "bg-green-tint text-green",
  outline: "border border-sand-line text-navy-soft bg-white",
} as const;

export function Badge({
  tone = "sand",
  className = "",
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof badgeTones }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${badgeTones[tone]} ${className}`}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

export function DemoBadge() {
  return (
    <Badge tone="outline" title="Konten contoh untuk keperluan demo MVP">
      Demo
    </Badge>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[0.875rem] border border-dashed border-sand-line bg-white/60 px-6 py-10 text-center">
      <p className="font-bold text-navy">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-md text-sm text-navy-mist">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <Card className="px-4 py-3">
      <p className={`text-2xl font-extrabold tracking-tight ${accent ? "text-red" : "text-navy"}`}>{value}</p>
      <p className="text-sm text-navy-mist">{label}</p>
    </Card>
  );
}

/* ── Identitas ─────────────────────────────────────────────── */

export function Avatar({
  name,
  hue,
  size = 40,
  className = "",
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: `hsl(${hue} 62% 88%)`,
        color: `hsl(${hue} 55% 28%)`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function Rating({
  value,
  count,
  size = 16,
  showEmpty = true,
}: {
  value: number | null;
  count?: number;
  size?: number;
  showEmpty?: boolean;
}) {
  if (value === null || count === 0) {
    return showEmpty ? <span className="text-sm text-navy-mist">Belum ada ulasan</span> : null;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
      <Star size={size} className="fill-gold text-gold" aria-hidden="true" />
      {value.toFixed(1)}
      {typeof count === "number" && <span className="font-normal text-navy-mist">({count})</span>}
    </span>
  );
}

export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-green-tint font-semibold text-green ${
        small ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
      }`}
      title="Identitas dan portofolio telah ditinjau tim TIFKREATIF"
    >
      <svg width={small ? 11 : 13} height={small ? 11 : 13} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l2.4 2.4 3.4-.5 1 3.3 3 1.6-1.3 3.2 1.3 3.2-3 1.6-1 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-1-3.3-3-1.6L3.5 12 2.2 8.8l3-1.6 1-3.3 3.4.5L12 2z" fill="currentColor" opacity=".2"/>
        <path d="M8.5 12.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Terverifikasi
    </span>
  );
}
