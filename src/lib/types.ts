export type Role = "client" | "provider" | "admin";
export type ClientType = "individu" | "umkm" | "perusahaan";
export type Availability = "tersedia" | "sibuk" | "libur";
export type WorkMode = "remote" | "onsite" | "hybrid";
export type ProjectKind = "open" | "direct";
export type ProjectStatus = "open" | "awarded" | "closed";
export type ProposalStatus = "sent" | "accepted" | "declined" | "withdrawn";
export type PackageTier = "basic" | "standard" | "premium";
export type OrderStatus =
  | "inquiry"
  | "negotiation"
  | "accepted"
  | "active"
  | "submitted"
  | "revision_requested"
  | "completed"
  | "cancelled";
export type PaymentStatus = "direct_agreement" | "pending" | "paid" | "refunded";
export type MilestoneStatus = "pending" | "in_progress" | "done";

export interface User {
  id: string;
  email: string;
  role: Role;
  is_active: number;
  is_demo: number;
  created_at: string;
}

export interface Profile {
  user_id: string;
  full_name: string;
  kabupaten: string;
  phone: string | null;
  bio: string | null;
  avatar_hue: number;
}

export interface SessionUser extends User {
  full_name: string;
  kabupaten: string;
  avatar_hue: number;
  username: string | null; // hanya provider
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: number;
  sort_order: number;
}

export interface ProviderCard {
  user_id: string;
  username: string;
  full_name: string;
  headline: string;
  kabupaten: string;
  is_verified: number;
  is_demo: number;
  availability: Availability;
  avatar_hue: number;
  rating: number | null;
  review_count: number;
  starting_price: number | null;
  skills: string[]; // nama kategori
}

export interface ProviderDetail extends ProviderCard {
  bio: string | null;
  response_time_hours: number;
  service_areas: string[];
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  estimated_days: number;
  revision_count: number;
  is_active: number;
  created_at: string;
}

export interface ServicePackage {
  id: string;
  service_id: string;
  tier: PackageTier;
  name: string;
  price: number;
  description: string;
  deliverables: string; // JSON string[]
  estimated_days: number;
  revision_count: number;
}

export interface ServiceAddon {
  id: string;
  service_id: string;
  name: string;
  price: number;
}

export interface ServiceCard extends Service {
  category_name: string;
  provider_name: string;
  provider_username: string;
  provider_kabupaten: string;
  is_verified: number;
  min_price: number | null;
  rating: number | null;
  review_count: number;
  cover_seed: number;
}

export interface PortfolioItem {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category_id: string | null;
  category_name?: string | null;
  year: number | null;
  cover_seed: number;
  is_active: number;
}

export interface Project {
  id: string;
  client_id: string;
  target_provider_id: string | null;
  kind: ProjectKind;
  title: string;
  description: string;
  category_id: string;
  kabupaten: string;
  work_mode: WorkMode;
  budget_min: number;
  budget_max: number;
  deadline: string | null;
  status: ProjectStatus;
  created_at: string;
}

export interface ProjectCard extends Project {
  category_name: string;
  client_name: string;
  proposal_count: number;
}

export interface Proposal {
  id: string;
  project_id: string;
  provider_id: string;
  client_id: string;
  message: string;
  price: number;
  estimated_days: number;
  status: ProposalStatus;
  created_at: string;
}

export interface ProposalWithMeta extends Proposal {
  provider_name: string;
  provider_username: string;
  provider_hue: number;
  is_verified: number;
  rating: number | null;
  review_count: number;
  project_title: string;
  project_kind: ProjectKind;
}

export interface Order {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string | null;
  package_id: string | null;
  proposal_id: string | null;
  project_id: string | null;
  conversation_id: string;
  title: string;
  agreed_price: number;
  agreed_days: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderWithMeta extends Order {
  client_name: string;
  provider_name: string;
  provider_username: string;
  client_hue: number;
  provider_hue: number;
  has_review: number;
}

export interface Milestone {
  id: string;
  order_id: string;
  title: string;
  due_date: string | null;
  status: MilestoneStatus;
  sort_order: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  note: string;
  file_name: string | null;
  file_path: string | null;
  mime: string | null;
  size: number | null;
  created_at: string;
}

export interface RevisionRequest {
  id: string;
  order_id: string;
  delivery_id: string | null;
  message: string;
  status: "open" | "resolved";
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  is_demo: number;
  created_at: string;
  client_name?: string;
  client_hue?: number;
  order_title?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  sender_hue: number;
}

export interface ConversationListItem {
  id: string;
  order_id: string | null;
  order_title: string | null;
  other_name: string;
  other_hue: number;
  last_body: string | null;
  last_at: string | null;
  unread: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  is_read: number;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "user" | "service" | "project" | "portfolio" | "review";
  target_id: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reporter_name?: string;
}

export interface VerificationRequest {
  id: string;
  provider_id: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
  provider_name?: string;
  provider_username?: string;
}

export interface OrderActivity {
  id: string;
  order_id: string;
  actor_id: string | null;
  type: string;
  message: string;
  created_at: string;
  actor_name?: string | null;
}

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
} | null;
