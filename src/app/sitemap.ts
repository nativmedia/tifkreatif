import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const db = getDb();
  const services = db.prepare("SELECT slug FROM services WHERE is_active = 1").all() as { slug: string }[];
  const providers = db.prepare("SELECT username FROM provider_profiles").all() as { username: string }[];
  const projects = db
    .prepare("SELECT id FROM projects WHERE status = 'open' AND kind = 'open'")
    .all() as { id: string }[];

  const staticPages = ["", "/talenta", "/proyek", "/cara-kerja", "/tentang", "/bantuan", "/kebijakan-privasi", "/syarat-ketentuan", "/masuk", "/daftar"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const })),
    ...providers.map((p) => ({ url: `${SITE.url}/talenta/${p.username}`, changeFrequency: "weekly" as const })),
    ...services.map((s) => ({ url: `${SITE.url}/layanan/${s.slug}`, changeFrequency: "weekly" as const })),
    ...projects.map((p) => ({ url: `${SITE.url}/proyek/${p.id}`, changeFrequency: "daily" as const })),
  ];
}
