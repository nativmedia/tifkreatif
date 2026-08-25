import type { OrderStatus, Availability, WorkMode, PackageTier } from "./types";

export const KABUPATEN = ["Bangkalan", "Sampang", "Pamekasan", "Sumenep"] as const;
export const KABUPATEN_LUAR = ["Surabaya", "Luar Madura"] as const;
export const ALL_AREAS = [...KABUPATEN, ...KABUPATEN_LUAR];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  inquiry: "Permintaan masuk",
  negotiation: "Negosiasi",
  accepted: "Disepakati",
  active: "Dikerjakan",
  submitted: "Hasil dikirim",
  revision_requested: "Revisi diminta",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "sand" | "gold" | "navy" | "red" | "green"> = {
  inquiry: "sand",
  negotiation: "gold",
  accepted: "navy",
  active: "navy",
  submitted: "gold",
  revision_requested: "red",
  completed: "green",
  cancelled: "sand",
};

/** Transisi status order yang sah, ditegakkan di server. */
export const ORDER_TRANSITIONS: Record<OrderStatus, { to: OrderStatus; by: "client" | "provider" | "both"; label: string }[]> = {
  inquiry: [
    { to: "negotiation", by: "both", label: "Mulai negosiasi" },
    { to: "accepted", by: "provider", label: "Terima pesanan" },
    { to: "cancelled", by: "both", label: "Batalkan" },
  ],
  negotiation: [
    { to: "accepted", by: "provider", label: "Sepakati & terima" },
    { to: "cancelled", by: "both", label: "Batalkan" },
  ],
  accepted: [
    { to: "active", by: "provider", label: "Mulai pengerjaan" },
    { to: "cancelled", by: "both", label: "Batalkan" },
  ],
  active: [{ to: "submitted", by: "provider", label: "Kirim hasil" }],
  submitted: [
    { to: "completed", by: "client", label: "Setujui & selesaikan" },
    { to: "revision_requested", by: "client", label: "Minta revisi" },
  ],
  revision_requested: [{ to: "submitted", by: "provider", label: "Kirim hasil revisi" }],
  completed: [],
  cancelled: [],
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  tersedia: "Tersedia",
  sibuk: "Sedang sibuk",
  libur: "Sedang libur",
};

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  remote: "Remote",
  onsite: "Datang ke lokasi",
  hybrid: "Hybrid",
};

export const TIER_LABEL: Record<PackageTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

export const CLIENT_TYPE_LABEL = {
  individu: "Individu",
  umkm: "UMKM",
  perusahaan: "Perusahaan / Instansi",
} as const;

export const SITE = {
  name: "TIFKREATIF",
  tagline: "Temukan Talenta Kreatif Madura.",
  supporting: "Dari Madura, untuk karya yang lebih besar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
