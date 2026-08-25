/**
 * Skema database TIFKREATIF (SQLite untuk pengembangan lokal).
 * Struktur sengaja mencerminkan desain PostgreSQL di supabase/schema.sql
 * agar migrasi ke Supabase pada fase produksi bersifat 1:1.
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('client','provider','admin')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  is_demo       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS profiles (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  kabupaten  TEXT NOT NULL DEFAULT 'Bangkalan',
  phone      TEXT,
  bio        TEXT,
  avatar_hue INTEGER NOT NULL DEFAULT 210,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS client_profiles (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  client_type  TEXT NOT NULL DEFAULT 'individu' CHECK (client_type IN ('individu','umkm','perusahaan')),
  company_name TEXT
);

CREATE TABLE IF NOT EXISTS provider_profiles (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username            TEXT NOT NULL UNIQUE,
  headline            TEXT NOT NULL DEFAULT '',
  is_verified         INTEGER NOT NULL DEFAULT 0,
  response_time_hours INTEGER NOT NULL DEFAULT 24,
  availability        TEXT NOT NULL DEFAULT 'tersedia' CHECK (availability IN ('tersedia','sibuk','libur')),
  service_areas       TEXT NOT NULL DEFAULT '[]',
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_provider_username ON provider_profiles(username);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'sparkles',
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS provider_skills (
  id          TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE (provider_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_skills_provider ON provider_skills(provider_id);

CREATE TABLE IF NOT EXISTS services (
  id             TEXT PRIMARY KEY,
  provider_id    TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  category_id    TEXT NOT NULL REFERENCES categories(id),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL,
  estimated_days INTEGER NOT NULL DEFAULT 7,
  revision_count INTEGER NOT NULL DEFAULT 2,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);

CREATE TABLE IF NOT EXISTS service_packages (
  id             TEXT PRIMARY KEY,
  service_id     TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tier           TEXT NOT NULL CHECK (tier IN ('basic','standard','premium')),
  name           TEXT NOT NULL,
  price          INTEGER NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  deliverables   TEXT NOT NULL DEFAULT '[]',
  estimated_days INTEGER NOT NULL DEFAULT 7,
  revision_count INTEGER NOT NULL DEFAULT 2,
  UNIQUE (service_id, tier)
);

CREATE TABLE IF NOT EXISTS service_addons (
  id         TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  price      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id          TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id),
  year        INTEGER,
  cover_seed  INTEGER NOT NULL DEFAULT 1,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portfolio_provider ON portfolio_items(provider_id);

-- "projects" mencakup dua jalur: proyek terbuka (open) dan brief langsung
-- ke satu penyedia (direct, dengan target_provider_id terisi).
CREATE TABLE IF NOT EXISTS projects (
  id                 TEXT PRIMARY KEY,
  client_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_provider_id TEXT REFERENCES provider_profiles(user_id),
  kind               TEXT NOT NULL DEFAULT 'open' CHECK (kind IN ('open','direct')),
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  category_id        TEXT NOT NULL REFERENCES categories(id),
  kabupaten          TEXT NOT NULL,
  work_mode          TEXT NOT NULL DEFAULT 'remote' CHECK (work_mode IN ('remote','onsite','hybrid')),
  budget_min         INTEGER NOT NULL DEFAULT 0,
  budget_max         INTEGER NOT NULL DEFAULT 0,
  deadline           TEXT,
  status             TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','awarded','closed')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status, kind);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_target ON projects(target_provider_id);

CREATE TABLE IF NOT EXISTS project_attachments (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name  TEXT NOT NULL,
  file_path  TEXT NOT NULL,
  mime       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS proposals (
  id             TEXT PRIMARY KEY,
  project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider_id    TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  client_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message        TEXT NOT NULL,
  price          INTEGER NOT NULL,
  estimated_days INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','accepted','declined','withdrawn')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (project_id, provider_id)
);
CREATE INDEX IF NOT EXISTS idx_proposals_project ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_provider ON proposals(provider_id);

CREATE TABLE IF NOT EXISTS favorites (
  id          TEXT PRIMARY KEY,
  client_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (client_id, provider_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id         TEXT PRIMARY KEY,
  order_id   TEXT,
  project_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL REFERENCES users(id),
  provider_id     TEXT NOT NULL REFERENCES provider_profiles(user_id),
  service_id      TEXT REFERENCES services(id),
  package_id      TEXT REFERENCES service_packages(id),
  proposal_id     TEXT REFERENCES proposals(id),
  project_id      TEXT REFERENCES projects(id),
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  title           TEXT NOT NULL,
  agreed_price    INTEGER NOT NULL,
  agreed_days     INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN
    ('inquiry','negotiation','accepted','active','submitted','revision_requested','completed','cancelled')),
  payment_status  TEXT NOT NULL DEFAULT 'direct_agreement' CHECK (payment_status IN
    ('direct_agreement','pending','paid','refunded')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_milestones (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  due_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_milestones_order ON order_milestones(order_id);

CREATE TABLE IF NOT EXISTS deliveries (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  file_name  TEXT,
  file_path  TEXT,
  mime       TEXT,
  size       INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);

CREATE TABLE IF NOT EXISTS revision_requests (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_id TEXT REFERENCES deliveries(id),
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  client_id   TEXT NOT NULL REFERENCES users(id),
  provider_id TEXT NOT NULL REFERENCES provider_profiles(user_id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  is_demo     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  link       TEXT NOT NULL DEFAULT '',
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS reports (
  id          TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user','service','project','portfolio','review')),
  target_id   TEXT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id          TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  note        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at  TEXT
);

CREATE TABLE IF NOT EXISTS order_activities (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor_id   TEXT REFERENCES users(id),
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activities_order ON order_activities(order_id, created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
`;
