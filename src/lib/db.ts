import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";
import { runSeed } from "./seed";

// Vercel's deployed bundle is read-only; use its writable temporary directory.
// SQLite remains suitable for the MVP/demo, but data is not durable across
// serverless instance lifetimes and should be migrated to Supabase for production.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "tifkreatif-data")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tifkreatif.db");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

declare global {
  var __tifDb: Database.Database | undefined;
}

const IS_TEST = process.env.TIFKREATIF_TEST === "1";

function createConnection(): Database.Database {
  if (!IS_TEST) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const db = new Database(IS_TEST ? ":memory:" : DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
  return db;
}

/** Koneksi singleton — aman terhadap hot-reload Next.js di development. */
export function getDb(): Database.Database {
  if (!globalThis.__tifDb) {
    globalThis.__tifDb = createConnection();
    maybeAutoSeed(globalThis.__tifDb);
  }
  return globalThis.__tifDb;
}

function maybeAutoSeed(db: Database.Database) {
  if (IS_TEST || process.env.AUTO_SEED === "false") return;
  const row = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (row.n > 0) return;
  runSeed(db);
  console.log("[tifkreatif] Database kosong — data demo berhasil di-seed.");
}

export function uid(): string {
  return crypto.randomUUID();
}
