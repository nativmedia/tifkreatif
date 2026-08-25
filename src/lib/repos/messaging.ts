import "server-only";
import { getDb, uid } from "../db";
import type { ConversationListItem, Message, Notification } from "../types";

export function createConversation(memberIds: string[], orderId: string | null = null): string {
  const db = getDb();
  const id = uid();
  db.prepare("INSERT INTO conversations (id, order_id) VALUES (?, ?)").run(id, orderId);
  const insMember = db.prepare(
    "INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)"
  );
  for (const m of memberIds) insMember.run(id, m);
  return id;
}

export function isConversationMember(conversationId: string, userId: string): boolean {
  return !!getDb()
    .prepare("SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?")
    .get(conversationId, userId);
}

export function listConversations(userId: string): ConversationListItem[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.order_id, o.title AS order_title,
              p.full_name AS other_name, p.avatar_hue AS other_hue,
              (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1)       AS last_body,
              (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id
                 AND m.sender_id != ? AND m.created_at > cm.last_read_at)                                          AS unread
         FROM conversations c
         JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = ?
         JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id != ?
         JOIN profiles p ON p.user_id = other.user_id
         LEFT JOIN orders o ON o.id = c.order_id
        ORDER BY COALESCE(last_at, c.created_at) DESC`
    )
    .all(userId, userId, userId) as ConversationListItem[];
}

export function getConversationMeta(conversationId: string, userId: string): { other_name: string; order_id: string | null; order_title: string | null } | undefined {
  return getDb()
    .prepare(
      `SELECT p.full_name AS other_name, c.order_id, o.title AS order_title
         FROM conversations c
         JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id != ?
         JOIN profiles p ON p.user_id = other.user_id
         LEFT JOIN orders o ON o.id = c.order_id
        WHERE c.id = ?`
    )
    .get(userId, conversationId) as { other_name: string; order_id: string | null; order_title: string | null } | undefined;
}

export function listMessages(conversationId: string, limit = 200): Message[] {
  return getDb()
    .prepare(
      `SELECT m.*, p.full_name AS sender_name, p.avatar_hue AS sender_hue
         FROM messages m JOIN profiles p ON p.user_id = m.sender_id
        WHERE m.conversation_id = ? ORDER BY m.created_at ASC LIMIT ?`
    )
    .all(conversationId, limit) as Message[];
}

export function sendMessage(conversationId: string, senderId: string, body: string): Message {
  const db = getDb();
  const id = uid();
  db.prepare("INSERT INTO messages (id, conversation_id, sender_id, body) VALUES (?, ?, ?, ?)").run(
    id, conversationId, senderId, body
  );
  markConversationRead(conversationId, senderId);
  // Notifikasi ringan untuk anggota lain
  const others = db
    .prepare("SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?")
    .all(conversationId, senderId) as { user_id: string }[];
  const sender = db.prepare("SELECT full_name FROM profiles WHERE user_id = ?").get(senderId) as { full_name: string };
  for (const o of others) {
    createNotification(o.user_id, "message", "Pesan baru", `${sender.full_name}: ${body.slice(0, 80)}`, `/pesan/${conversationId}`);
  }
  return db
    .prepare(
      `SELECT m.*, p.full_name AS sender_name, p.avatar_hue AS sender_hue
         FROM messages m JOIN profiles p ON p.user_id = m.sender_id WHERE m.id = ?`
    )
    .get(id) as Message;
}

export function markConversationRead(conversationId: string, userId: string): void {
  getDb()
    .prepare(
      "UPDATE conversation_members SET last_read_at = datetime('now') WHERE conversation_id = ? AND user_id = ?"
    )
    .run(conversationId, userId);
}

export function totalUnreadMessages(userId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM messages m
         JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
        WHERE m.sender_id != ? AND m.created_at > cm.last_read_at`
    )
    .get(userId, userId) as { n: number };
  return row.n;
}

/* ── Notifikasi ─────────────────────────────────────────────── */

export function createNotification(userId: string, type: string, title: string, body: string, link: string): void {
  getDb()
    .prepare("INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)")
    .run(uid(), userId, type, title, body, link);
}

export function listNotifications(userId: string, limit = 30): Notification[] {
  return getDb()
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(userId, limit) as Notification[];
}

export function unreadNotificationCount(userId: string): number {
  return (
    getDb().prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0").get(userId) as { n: number }
  ).n;
}

export function markAllNotificationsRead(userId: string): void {
  getDb().prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
}
