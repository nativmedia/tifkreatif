/** Jalankan: npm run db:seed (reset penuh: npm run db:reset) */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "../src/lib/schema";
import { runSeed } from "../src/lib/seed";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "tifkreatif.db");

if (process.argv.includes("--reset") && fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
  console.log("Database lama dihapus.");
}
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(dbPath);
db.exec(SCHEMA_SQL);
const count = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
if (count > 0) {
  console.log(`Database sudah berisi ${count} pengguna — seed dilewati. Gunakan --reset untuk mengulang.`);
} else {
  runSeed(db);
  console.log("Seed selesai. Akun demo: klien@demo.tifkreatif.id / talenta@demo.tifkreatif.id / admin@demo.tifkreatif.id (sandi: demo1234)");
}
db.close();
