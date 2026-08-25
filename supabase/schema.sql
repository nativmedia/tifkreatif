-- ============================================================================
-- TIFKREATIF — Skema Supabase (PostgreSQL) + Row Level Security
-- ============================================================================
-- Jalur migrasi dari SQLite MVP (src/lib/schema.ts) ke Supabase.
-- Catatan jujur: file ini disiapkan sebagai deliverable migrasi dan BELUM
-- dieksekusi terhadap instans Supabase nyata (lingkungan build tidak punya
-- kredensial/akses). Tinjau ulang sebelum dipakai di produksi.
--
-- Perbedaan utama vs SQLite:
--   * id memakai uuid (default gen_random_uuid()); auth memakai Supabase Auth,
--     sehingga users di sini menjadi profil publik yang ber-relasi ke auth.users.
--   * timestamptz menggantikan TEXT datetime.
--   * RLS diaktifkan; akses ditentukan oleh auth.uid().
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------- Enum ------------------------------------------------------------
create type user_role      as enum ('client','provider','admin');
create type client_type    as enum ('individu','umkm','perusahaan','komunitas');
create type availability_t as enum ('tersedia','sibuk','libur');
create type work_mode_t    as enum ('remote','onsite','hybrid');
create type project_kind   as enum ('open','direct');
create type project_status as enum ('open','awarded','closed','cancelled');
create type proposal_status as enum ('sent','accepted','declined','withdrawn');
create type package_tier   as enum ('basic','standard','premium');
create type order_status   as enum ('inquiry','negotiation','accepted','active',
                                    'submitted','revision_requested','completed','cancelled');
create type payment_status as enum ('direct_agreement','pending','paid','refunded');
create type milestone_status as enum ('pending','in_progress','done');
create type revision_status  as enum ('open','resolved');
create type verification_status as enum ('pending','approved','rejected');
create type report_status  as enum ('open','resolved','dismissed');
create type report_target  as enum ('user','service','project','review');

-- ---------- Profil & peran --------------------------------------------------
-- Profil aplikasi; id = auth.users.id (Supabase Auth memegang email+password).
create table profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'client',
  full_name   text not null,
  kabupaten   text not null,
  phone       text,
  bio         text,
  avatar_hue  int  not null default 200,
  is_active   boolean not null default true,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table client_profiles (
  user_id      uuid primary key references profiles(user_id) on delete cascade,
  client_type  client_type not null default 'individu',
  company_name text
);

create table provider_profiles (
  user_id             uuid primary key references profiles(user_id) on delete cascade,
  username            text not null unique,
  headline            text not null default '',
  is_verified         boolean not null default false,
  response_time_hours int not null default 6,
  availability        availability_t not null default 'tersedia',
  service_areas       jsonb not null default '[]',
  created_at          timestamptz not null default now()
);

create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  icon        text not null default 'sparkles',
  is_active   boolean not null default true,
  sort_order  int not null default 100
);

create table provider_skills (
  provider_id uuid not null references provider_profiles(user_id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

-- ---------- Layanan ---------------------------------------------------------
create table services (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid not null references provider_profiles(user_id) on delete cascade,
  category_id    uuid not null references categories(id),
  title          text not null,
  slug           text not null unique,
  description    text not null,
  estimated_days int not null default 7,
  revision_count int not null default 2,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table service_packages (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid not null references services(id) on delete cascade,
  tier           package_tier not null,
  name           text not null,
  price          bigint not null check (price >= 0),
  description    text not null default '',
  deliverables   jsonb not null default '[]',
  estimated_days int not null default 7,
  revision_count int not null default 1,
  unique (service_id, tier)
);

create table service_addons (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  name       text not null,
  price      bigint not null check (price >= 0)
);

create table portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles(user_id) on delete cascade,
  title       text not null,
  description text not null default '',
  category_id uuid references categories(id),
  year        int,
  cover_seed  int not null default 1,
  image_path  text,                      -- fase berikutnya: Supabase Storage
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Proyek & proposal ----------------------------------------------
create table projects (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references profiles(user_id) on delete cascade,
  target_provider_id uuid references provider_profiles(user_id),
  kind               project_kind not null default 'open',
  title              text not null,
  description        text not null,
  category_id        uuid not null references categories(id),
  kabupaten          text not null,
  work_mode          work_mode_t not null default 'remote',
  budget_min         bigint not null default 0,
  budget_max         bigint not null,
  deadline           date,
  status             project_status not null default 'open',
  created_at         timestamptz not null default now()
);

create table proposals (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects(id) on delete cascade,
  provider_id    uuid not null references provider_profiles(user_id) on delete cascade,
  client_id      uuid not null references profiles(user_id) on delete cascade,
  message        text not null,
  price          bigint not null,
  estimated_days int not null,
  status         proposal_status not null default 'sent',
  created_at     timestamptz not null default now(),
  unique (project_id, provider_id)
);

-- ---------- Percakapan ------------------------------------------------------
create table conversations (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid,
  created_at timestamptz not null default now()
);

create table conversation_members (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid not null references profiles(user_id) on delete cascade,
  last_read_at    timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(user_id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);

-- ---------- Pesanan ---------------------------------------------------------
create table orders (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references profiles(user_id),
  provider_id     uuid not null references provider_profiles(user_id),
  service_id      uuid references services(id),
  package_id      uuid references service_packages(id),
  proposal_id     uuid references proposals(id),
  project_id      uuid references projects(id),
  conversation_id uuid not null references conversations(id),
  title           text not null,
  agreed_price    bigint not null,
  agreed_days     int not null,
  status          order_status not null default 'inquiry',
  payment_status  payment_status not null default 'direct_agreement',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table conversations
  add constraint conversations_order_fk foreign key (order_id) references orders(id) on delete set null;

create table order_milestones (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  title      text not null,
  due_date   date,
  status     milestone_status not null default 'pending',
  sort_order int not null default 1,
  created_at timestamptz not null default now()
);

create table deliveries (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  note       text not null,
  file_name  text,
  file_path  text,           -- fase berikutnya: bucket privat Supabase Storage
  mime       text,
  size       bigint,
  created_at timestamptz not null default now()
);

create table revision_requests (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  delivery_id uuid references deliveries(id),
  message     text not null,
  status      revision_status not null default 'open',
  created_at  timestamptz not null default now()
);

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references orders(id) on delete cascade,
  client_id   uuid not null references profiles(user_id),
  provider_id uuid not null references provider_profiles(user_id),
  rating      int not null check (rating between 1 and 5),
  comment     text not null,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table order_activities (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  actor_id   uuid references profiles(user_id),
  type       text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ---------- Sosial & moderasi ----------------------------------------------
create table favorites (
  client_id   uuid not null references profiles(user_id) on delete cascade,
  provider_id uuid not null references provider_profiles(user_id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (client_id, provider_id)
);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(user_id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  link       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(user_id) on delete cascade,
  target_type report_target not null,
  target_id   text not null,
  reason      text not null,
  status      report_status not null default 'open',
  created_at  timestamptz not null default now()
);

create table verification_requests (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles(user_id) on delete cascade,
  note        text not null,
  status      verification_status not null default 'pending',
  created_at  timestamptz not null default now(),
  decided_at  timestamptz
);

-- ---------- Index -----------------------------------------------------------
create index on services (provider_id);
create index on services (category_id) where is_active;
create index on projects (status, kind, created_at desc);
create index on proposals (project_id);
create index on proposals (provider_id);
create index on messages (conversation_id, created_at);
create index on orders (client_id, updated_at desc);
create index on orders (provider_id, updated_at desc);
create index on reviews (provider_id);
create index on notifications (user_id, is_read);

-- ---------- Fungsi bantu RLS ------------------------------------------------
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where user_id = auth.uid() and role = 'admin') $$;

create or replace function is_order_party(o_id uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from orders where id = o_id
                  and (client_id = auth.uid() or provider_id = auth.uid())) $$;

create or replace function is_conversation_member(c_id uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from conversation_members
                  where conversation_id = c_id and user_id = auth.uid()) $$;

-- ---------- RLS -------------------------------------------------------------
alter table profiles              enable row level security;
alter table client_profiles       enable row level security;
alter table provider_profiles     enable row level security;
alter table categories            enable row level security;
alter table provider_skills       enable row level security;
alter table services              enable row level security;
alter table service_packages      enable row level security;
alter table service_addons        enable row level security;
alter table portfolio_items       enable row level security;
alter table projects              enable row level security;
alter table proposals             enable row level security;
alter table conversations         enable row level security;
alter table conversation_members  enable row level security;
alter table messages              enable row level security;
alter table orders                enable row level security;
alter table order_milestones      enable row level security;
alter table deliveries            enable row level security;
alter table revision_requests     enable row level security;
alter table reviews               enable row level security;
alter table order_activities      enable row level security;
alter table favorites             enable row level security;
alter table notifications         enable row level security;
alter table reports               enable row level security;
alter table verification_requests enable row level security;

-- Katalog publik: bisa dibaca siapa pun.
create policy "categories read"      on categories        for select using (true);
create policy "profiles read"        on profiles          for select using (true);
create policy "provider read"        on provider_profiles for select using (true);
create policy "skills read"          on provider_skills   for select using (true);
create policy "services read"        on services          for select using (is_active or provider_id = auth.uid() or is_admin());
create policy "packages read"        on service_packages  for select using (true);
create policy "addons read"          on service_addons    for select using (true);
create policy "portfolio read"       on portfolio_items   for select using (is_active or provider_id = auth.uid());
create policy "reviews read"         on reviews           for select using (true);

-- Profil: pemilik mengubah miliknya.
create policy "profiles update self" on profiles for update using (user_id = auth.uid());
create policy "client self"    on client_profiles   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "provider self"  on provider_profiles for update using (user_id = auth.uid());
create policy "skills manage"  on provider_skills   for all using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- Layanan & portofolio: penyedia mengelola miliknya; admin bisa moderasi.
create policy "services manage" on services for all
  using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "packages manage" on service_packages for all
  using (exists (select 1 from services s where s.id = service_id and (s.provider_id = auth.uid() or is_admin())))
  with check (exists (select 1 from services s where s.id = service_id and (s.provider_id = auth.uid() or is_admin())));
create policy "addons manage" on service_addons for all
  using (exists (select 1 from services s where s.id = service_id and s.provider_id = auth.uid()))
  with check (exists (select 1 from services s where s.id = service_id and s.provider_id = auth.uid()));
create policy "portfolio manage" on portfolio_items for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- Proyek: terbuka dibaca publik; brief langsung hanya pihak terkait.
create policy "projects read" on projects for select using (
  (kind = 'open' and status = 'open')
  or client_id = auth.uid()
  or target_provider_id = auth.uid()
  or is_admin()
);
create policy "projects insert" on projects for insert with check (client_id = auth.uid());
create policy "projects update owner" on projects for update using (client_id = auth.uid() or is_admin());

-- Proposal: pengirim & klien proyek yang bisa melihat.
create policy "proposals read" on proposals for select
  using (provider_id = auth.uid() or client_id = auth.uid() or is_admin());
create policy "proposals insert" on proposals for insert with check (provider_id = auth.uid());
create policy "proposals update parties" on proposals for update
  using (provider_id = auth.uid() or client_id = auth.uid());

-- Percakapan & pesan: hanya anggota.
create policy "conversations read" on conversations for select using (is_conversation_member(id) or is_admin());
create policy "members read"  on conversation_members for select using (user_id = auth.uid() or is_conversation_member(conversation_id));
create policy "members update self" on conversation_members for update using (user_id = auth.uid());
create policy "messages read" on messages for select using (is_conversation_member(conversation_id) or is_admin());
create policy "messages send" on messages for insert
  with check (sender_id = auth.uid() and is_conversation_member(conversation_id));

-- Pesanan & turunannya: hanya dua pihak (dan admin).
create policy "orders read"   on orders for select using (client_id = auth.uid() or provider_id = auth.uid() or is_admin());
create policy "orders update" on orders for update using (client_id = auth.uid() or provider_id = auth.uid());
create policy "milestones rw" on order_milestones for all
  using (is_order_party(order_id) or is_admin()) with check (is_order_party(order_id));
create policy "deliveries rw" on deliveries for all
  using (is_order_party(order_id) or is_admin()) with check (is_order_party(order_id));
create policy "revisions rw"  on revision_requests for all
  using (is_order_party(order_id) or is_admin()) with check (is_order_party(order_id));
create policy "activities read" on order_activities for select using (is_order_party(order_id) or is_admin());
create policy "reviews insert" on reviews for insert with check (client_id = auth.uid());

-- Sosial.
create policy "favorites rw" on favorites for all
  using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "notifications read" on notifications for select using (user_id = auth.uid());
create policy "notifications update" on notifications for update using (user_id = auth.uid());
create policy "reports insert" on reports for insert with check (reporter_id = auth.uid());
create policy "reports admin"  on reports for select using (reporter_id = auth.uid() or is_admin());
create policy "reports resolve" on reports for update using (is_admin());
create policy "verification own" on verification_requests for select using (provider_id = auth.uid() or is_admin());
create policy "verification ask" on verification_requests for insert with check (provider_id = auth.uid());
create policy "verification decide" on verification_requests for update using (is_admin());

-- Catatan implementasi lanjutan:
--   * Pembuatan orders/conversations sebaiknya lewat RPC (security definer)
--     agar transaksi multi-tabel tetap atomik dan aturan status ditegakkan
--     di database, meniru ORDER_TRANSITIONS pada src/lib/constants.ts.
--   * File delivery → bucket privat Storage dengan policy is_order_party.
