import { z } from "zod";
import { ALL_AREAS, KABUPATEN } from "./constants";

const kabupatenEnum = z.enum(KABUPATEN);
const areaEnum = z.enum(ALL_AREAS as [string, ...string[]]);

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(3, "Nama minimal 3 huruf").max(80, "Nama terlalu panjang"),
    email: z.string().trim().toLowerCase().email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(72),
    role: z.enum(["client", "provider"], { message: "Pilih peranmu dulu" }),
    kabupaten: kabupatenEnum,
    client_type: z.enum(["individu", "umkm", "perusahaan"]).optional(),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{4,24}$/, "Username 4–24 karakter: huruf kecil, angka, garis bawah")
      .optional()
      .or(z.literal("")),
    headline: z.string().trim().max(90, "Maksimal 90 karakter").optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "provider" && !val.username) {
      ctx.addIssue({ code: "custom", path: ["username"], message: "Username wajib untuk penyedia jasa" });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Masukkan kata sandi"),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Nama minimal 3 huruf").max(80),
  kabupaten: kabupatenEnum,
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|0)8[0-9]{7,12}$/, "Gunakan format nomor Indonesia, mis. 08xxxxxxxxxx")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(600, "Maksimal 600 karakter").optional(),
});

export const providerProfileSchema = z.object({
  headline: z.string().trim().min(10, "Ceritakan keahlianmu, minimal 10 karakter").max(90),
  response_time_hours: z.coerce.number().int().min(1).max(72),
  availability: z.enum(["tersedia", "sibuk", "libur"]),
  service_areas: z.array(areaEnum).min(1, "Pilih minimal satu area layanan"),
  skills: z.array(z.string().min(1)).min(1, "Pilih minimal satu kategori keahlian").max(6, "Maksimal 6 kategori"),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(10, "Judul minimal 10 karakter").max(80),
  category_id: z.string().min(1, "Pilih kategori"),
  description: z.string().trim().min(60, "Jelaskan layananmu, minimal 60 karakter").max(2000),
  estimated_days: z.coerce.number().int().min(1, "Minimal 1 hari").max(120),
  revision_count: z.coerce.number().int().min(0).max(10),
});

export const packageSchema = z.object({
  name: z.string().trim().min(3).max(40),
  price: z.coerce.number().int().min(10_000, "Harga minimal Rp10.000").max(1_000_000_000),
  description: z.string().trim().max(240),
  deliverables: z.string().trim().min(3, "Isi minimal satu deliverable"),
  estimated_days: z.coerce.number().int().min(1).max(120),
  revision_count: z.coerce.number().int().min(0).max(10),
});

export const portfolioSchema = z.object({
  title: z.string().trim().min(4, "Judul minimal 4 karakter").max(80),
  description: z.string().trim().max(400).optional(),
  category_id: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const projectSchema = z.object({
  title: z.string().trim().min(10, "Judul minimal 10 karakter").max(90),
  description: z.string().trim().min(40, "Ceritakan kebutuhanmu, minimal 40 karakter").max(3000),
  category_id: z.string().min(1, "Pilih kategori"),
  kabupaten: kabupatenEnum,
  work_mode: z.enum(["remote", "onsite", "hybrid"]),
  budget_min: z.coerce.number().int().min(0).max(1_000_000_000),
  budget_max: z.coerce.number().int().min(10_000, "Isi perkiraan budget maksimal").max(1_000_000_000),
  deadline: z.string().optional(),
}).refine((v) => v.budget_min <= v.budget_max, {
  path: ["budget_min"],
  message: "Budget minimal tidak boleh melebihi maksimal",
});

export const briefSchema = z.object({
  title: z.string().trim().min(10, "Judul minimal 10 karakter").max(90),
  description: z.string().trim().min(40, "Ceritakan kebutuhanmu, minimal 40 karakter").max(3000),
  category_id: z.string().min(1, "Pilih kategori"),
  work_mode: z.enum(["remote", "onsite", "hybrid"]),
  budget_max: z.coerce.number().int().min(10_000, "Isi perkiraan budget").max(1_000_000_000),
  deadline: z.string().optional(),
});

export const proposalSchema = z.object({
  message: z.string().trim().min(40, "Jelaskan pendekatanmu, minimal 40 karakter").max(2000),
  price: z.coerce.number().int().min(10_000, "Harga minimal Rp10.000").max(1_000_000_000),
  estimated_days: z.coerce.number().int().min(1, "Minimal 1 hari").max(180),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Pesan tidak boleh kosong").max(2000, "Maksimal 2000 karakter"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Beri rating 1–5").max(5),
  comment: z.string().trim().min(10, "Ceritakan pengalamanmu, minimal 10 karakter").max(1000),
});

export const revisionSchema = z.object({
  message: z.string().trim().min(10, "Jelaskan bagian yang perlu direvisi").max(1500),
});

export const deliverySchema = z.object({
  note: z.string().trim().min(10, "Sertakan catatan hasil, minimal 10 karakter").max(1500),
});

export const milestoneSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(80),
  due_date: z.string().optional(),
});

export const reportSchema = z.object({
  target_type: z.enum(["user", "service", "project", "portfolio", "review"]),
  target_id: z.string().min(1),
  reason: z.string().trim().min(10, "Jelaskan alasan laporan, minimal 10 karakter").max(600),
});

export const categorySchema = z.object({
  name: z.string().trim().min(3).max(40),
  description: z.string().trim().max(160).optional(),
  icon: z.string().trim().max(40).optional(),
  sort_order: z.coerce.number().int().min(0).max(999),
});

/** Ubah ZodError menjadi map field -> pesan pertama. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const ALLOWED_UPLOAD_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/zip",
]);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
