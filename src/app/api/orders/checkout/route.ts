import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateDynamicQRToken } from "@/lib/qr-security";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const rateCheck = checkRateLimit(`checkout:${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pemesanan. Coba lagi dalam beberapa saat." },
        { status: 429 }
      );
    }

    const session = await getCurrentUser();
    let userId = session?.id;

    if (!userId) {
      // Fallback to default student for demo ease
      const defaultStudent = await prisma.user.findUnique({
        where: { email: "mahasiswa@ecobite.ac.id" },
      });
      userId = defaultStudent?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, quantity = 1, paymentMethod = "QRIS", byocOptIn = false } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item makanan harus dipilih" }, { status: 400 });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    // Execute atomic transaction with concurrency protection
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check item & merchant status
      const item = await tx.surplusItem.findUnique({
        where: { id: itemId },
        include: { merchant: true },
      });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (!item.merchant.isOpen) {
        throw new Error("MERCHANT_CLOSED");
      }

      // 2. Strict concurrency decrement: only succeed if stockQuantity >= qty
      const updated = await tx.surplusItem.updateMany({
        where: {
          id: itemId,
          stockQuantity: { gte: qty },
          status: "AVAILABLE",
        },
        data: {
          stockQuantity: { decrement: qty },
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      // If new stock reaches 0, update status to SOLD_OUT
      const currentItem = await tx.surplusItem.findUnique({
        where: { id: itemId },
      });

      if (currentItem && currentItem.stockQuantity <= 0) {
        await tx.surplusItem.update({
          where: { id: itemId },
          data: { status: "SOLD_OUT" },
        });
      }

      // 3. Generate unique order number (e.g. #EB-88492)
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `#EB-${randomCode}`;
      const totalPrice = item.discountedPrice * qty;

      // 4. Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          merchantId: item.merchantId,
          itemId: item.id,
          quantity: qty,
          totalPrice,
          paymentMethod,
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          byocOptIn: Boolean(byocOptIn),
          byocVerified: false,
        },
        include: {
          item: true,
          merchant: true,
          user: true,
        },
      });

      // 5. Generate secure dynamic QR token
      const qrToken = generateDynamicQRToken(order.id, order.orderNumber);
      const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 mins pickup window

      const rescuePass = await tx.rescuePass.create({
        data: {
          orderId: order.id,
          qrSecret: "ecobite-qr-key",
          dynamicQrToken: qrToken,
          expiresAt,
          status: "ACTIVE",
        },
      });

      return { order, rescuePass };
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      rescuePass: result.rescuePass,
      message: "Pesanan surplus berhasil diamankan!",
    });
  } catch (error: any) {
    console.error("Checkout transaction error:", error);

    if (error.message === "OUT_OF_STOCK") {
      return NextResponse.json(
        {
          error: "Maaf, porsi surplus ini baru saja habis diselamatkan oleh mahasiswa lain!",
          code: "OUT_OF_STOCK",
        },
        { status: 409 }
      );
    }

    if (error.message === "MERCHANT_CLOSED") {
      return NextResponse.json(
        { error: "Kantin sedang tidak menerima pengambilan surplus saat ini." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memproses pesanan surplus. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
