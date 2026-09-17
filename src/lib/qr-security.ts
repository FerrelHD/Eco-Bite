import crypto from "crypto";

const QR_SECRET = process.env.QR_HMAC_SECRET || "ecobite-campus-food-rescue-secret-key-2026";

export interface DynamicQRPayload {
  orderId: string;
  orderNumber: string;
  timestamp: number;
  nonce: string;
}

export function generateDynamicQRToken(orderId: string, orderNumber: string): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(4).toString("hex");
  const data = `${orderId}:${orderNumber}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", QR_SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16); // 16-char compact signature

  // Format: v1.<orderId>.<orderNumber>.<timestamp>.<nonce>.<signature>
  return `v1.${orderId}.${orderNumber}.${timestamp}.${nonce}.${signature}`;
}

export function verifyDynamicQRToken(token: string, maxAgeMs: number = 24 * 60 * 60 * 1000): {
  valid: boolean;
  orderId?: string;
  orderNumber?: string;
  expired?: boolean;
  error?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 6 || parts[0] !== "v1") {
      return { valid: false, error: "Format token QR tidak valid" };
    }

    const [, orderId, orderNumber, timestampStr, nonce, receivedSig] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return { valid: false, error: "Timestamp token tidak valid" };
    }

    // Check expiration
    if (Date.now() - timestamp > maxAgeMs) {
      return { valid: false, expired: true, error: "Token QR telah kedaluwarsa" };
    }

    // Verify HMAC signature
    const data = `${orderId}:${orderNumber}:${timestamp}:${nonce}`;
    const expectedSig = crypto
      .createHmac("sha256", QR_SECRET)
      .update(data)
      .digest("hex")
      .slice(0, 16);

    const match = crypto.timingSafeEqual(
      Buffer.from(receivedSig),
      Buffer.from(expectedSig)
    );

    if (!match) {
      return { valid: false, error: "Tanda tangan kriptografi QR palsu atau rusak" };
    }

    return {
      valid: true,
      orderId,
      orderNumber,
      expired: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memverifikasi token QR";
    return { valid: false, error: errorMsg };
  }
}
