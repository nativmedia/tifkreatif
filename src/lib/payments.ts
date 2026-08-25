/**
 * Batas integrasi pembayaran TIFKREATIF.
 *
 * MVP secara sadar TIDAK memproses pembayaran: kesepakatan pembayaran
 * dilakukan langsung antara klien dan penyedia, dan hal ini ditampilkan
 * jujur di UI (payment_status = 'direct_agreement').
 *
 * Fase berikutnya: implementasikan PaymentGateway dengan Midtrans Snap
 * atau Xendit Invoice, lalu perbarui orders.payment_status melalui
 * webhook ('pending' -> 'paid' / 'refunded').
 */
import type { Order, PaymentStatus } from "./types";

export interface PaymentGateway {
  /** Membuat tautan/invoice pembayaran untuk sebuah order. */
  createInvoice(order: Order): Promise<{ url: string; reference: string }>;
  /** Memverifikasi callback webhook dan mengembalikan status terbaru. */
  handleWebhook(payload: unknown): Promise<{ orderId: string; status: PaymentStatus }>;
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  direct_agreement: "Kesepakatan langsung",
  pending: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  refunded: "Dikembalikan",
};

/** Placeholder eksplisit — melempar error agar tidak ada ilusi pembayaran berfungsi. */
export const gateway: PaymentGateway = {
  async createInvoice() {
    throw new Error("Gateway pembayaran belum dikonfigurasi. Lihat src/lib/payments.ts");
  },
  async handleWebhook() {
    throw new Error("Gateway pembayaran belum dikonfigurasi. Lihat src/lib/payments.ts");
  },
};
