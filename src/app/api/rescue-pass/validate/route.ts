import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyDynamicQRToken } from "@/lib/qr-security";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let merchantUserId = session?.id;

    if (!merchantUserId) {
      // Fallback to default merchant for testing ease
      const defaultMerchant = await prisma.user.findUnique({
        where: { email: "kulina@ecobite.ac.id" },
      });
      merchantUserId = defaultMerchant?.id;
    }

    // Find merchant associated with this user
    const merchant = await prisma.merchant.findFirst({
      where: { userId: merchantUserId },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Akun Anda tidak terdaftar sebagai pengelola gerai kantin" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { qrToken, ticketCode, action = "preview", byocVerified = false } = body;

    let targetOrderNumber: string | null = null;
    let targetOrderId: string | null = null;

    if (qrToken) {
      const verifyResult = verifyDynamicQRToken(qrToken);
      if (!verifyResult.valid) {
        return NextResponse.json(
          { error: verifyResult.error || "Token QR tidak valid atau telah dimanipulasi", code: "INVALID_QR" },
          { status: 400 }
        );
      }
      targetOrderId = verifyResult.orderId!;
      targetOrderNumber = verifyResult.orderNumber!;
    } else if (ticketCode) {
      const cleaned = ticketCode.trim();
      targetOrderNumber = cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
    } else {
      return NextResponse.json({ error: "QR Token atau Kode Tiket harus disediakan" }, { status: 400 });
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: targetOrderId
        ? { id: targetOrderId }
        : {
            orderNumber: {
              equals: targetOrderNumber!,
            },
          },
      include: {
        item: true,
        merchant: true,
        user: true,
        rescuePass: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Tiket pesanan tidak ditemukan di sistem" }, { status: 404 });
    }

    // Verify store ownership: Merchant can only validate orders for their own store
    if (order.merchantId !== merchant.id) {
      return NextResponse.json(
        {
          error: `Tiket ini ditujukan untuk gerai '${order.merchant.storeName}', bukan '${merchant.storeName}'`,
          code: "STORE_MISMATCH",
        },
        { status: 403 }
      );
    }

    // Check if already redeemed
    if (order.orderStatus === "COMPLETED") {
      return NextResponse.json(
        {
          error: "Tiket ini sudah pernah diverifikasi dan makanan telah diserahkan sebelumnya!",
          code: "ALREADY_REDEEMED",
          order,
        },
        { status: 400 }
      );
    }

    if (action === "preview") {
      return NextResponse.json({
        success: true,
        action: "preview",
        order,
      });
    }

    if (action === "confirm") {
      // Execute redemption transaction
      const redeemed = await prisma.$transaction(async (tx) => {
        // Mark order completed
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "COMPLETED",
            byocVerified: Boolean(byocVerified),
          },
          include: {
            user: true,
            item: true,
            merchant: true,
          },
        });

        // Mark rescue pass redeemed
        if (order.rescuePass) {
          await tx.rescuePass.update({
            where: { id: order.rescuePass.id },
            data: { status: "REDEEMED" },
          });
        }

        // Calculate impact metrics
        const foodWeightKg = 0.45 * order.quantity;
        const co2SavedKg = Number((foodWeightKg * 2.1).toFixed(2));
        const moneySavedRp = (order.item.originalPrice - order.item.discountedPrice) * order.quantity;
        const basePoints = 50 * order.quantity;
        const bonusPoints = byocVerified ? 50 : 0;
        const totalPointsAwarded = basePoints + bonusPoints;

        // Log impact
        await tx.ecoImpactLog.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            foodWeightKg,
            co2SavedKg,
            moneySavedRp,
            pointsAwarded: totalPointsAwarded,
          },
        });

        // Award points to student
        await tx.user.update({
          where: { id: order.userId },
          data: {
            ecoPoints: { increment: totalPointsAwarded },
          },
        });

        return {
          order: updatedOrder,
          pointsAwarded: totalPointsAwarded,
          impact: {
            foodWeightKg,
            co2SavedKg,
            moneySavedRp,
          },
        };
      });

      return NextResponse.json({
        success: true,
        action: "confirm",
        order: redeemed.order,
        pointsAwarded: redeemed.pointsAwarded,
        impact: redeemed.impact,
        message: "Penyerahan makanan berhasil diverifikasi!",
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    console.error("Point of redemption error:", error);
    return NextResponse.json(
      { error: "Gagal memproses validasi tiket di kasir" },
      { status: 500 }
    );
  }
}
