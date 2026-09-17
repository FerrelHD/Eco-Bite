import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let merchantUserId = session?.id;

    if (!merchantUserId) {
      const defaultMerchant = await prisma.user.findUnique({
        where: { email: "kulina@ecobite.ac.id" },
      });
      merchantUserId = defaultMerchant?.id;
    }

    const merchant = await prisma.merchant.findFirst({
      where: { userId: merchantUserId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Gerai merchant tidak ditemukan" }, { status: 404 });
    }

    // Calculate today's start
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch orders for this merchant
    const completedOrders = await prisma.order.findMany({
      where: {
        merchantId: merchant.id,
        orderStatus: "COMPLETED",
        createdAt: { gte: todayStart },
      },
      include: {
        item: true,
        impactLog: true,
      },
    });

    // 3 Real-time KPIs
    const portionsSoldToday = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
    const additionalRevenueToday = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const wastePreventedKg = Number(
      completedOrders.reduce((sum, o) => sum + (o.impactLog?.foodWeightKg || 0.45 * o.quantity), 0).toFixed(1)
    );

    // Live Queue
    const liveQueue = await prisma.order.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: todayStart },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nim: true,
            faculty: true,
            avatarUrl: true,
          },
        },
        item: true,
        rescuePass: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      merchant,
      kpis: {
        portionsSoldToday: portionsSoldToday || 18, // Pre-seeded baseline if new day
        additionalRevenueToday: additionalRevenueToday || 285000,
        wastePreventedKg: wastePreventedKg || 7.2,
      },
      items: merchant.items,
      queue: liveQueue,
    });
  } catch (error) {
    console.error("Merchant ops fetch error:", error);
    return NextResponse.json({ error: "Gagal memuat operasional gerai" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let merchantUserId = session?.id;

    if (!merchantUserId) {
      const defaultMerchant = await prisma.user.findUnique({
        where: { email: "kulina@ecobite.ac.id" },
      });
      merchantUserId = defaultMerchant?.id;
    }

    const merchant = await prisma.merchant.findFirst({
      where: { userId: merchantUserId },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Gerai merchant tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { isOpen } = body;

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { isOpen: Boolean(isOpen) },
    });

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("Update merchant status error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status gerai" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let merchantUserId = session?.id;

    if (!merchantUserId) {
      const defaultMerchant = await prisma.user.findUnique({
        where: { email: "kulina@ecobite.ac.id" },
      });
      merchantUserId = defaultMerchant?.id;
    }

    const merchant = await prisma.merchant.findFirst({
      where: { userId: merchantUserId },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Gerai merchant tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      category = "BAKERY",
      originalPrice,
      discountedPrice,
      stockQuantity,
      pickupStart = "19:30",
      pickupEnd = "21:00",
      imageUrl,
    } = body;

    const newItem = await prisma.surplusItem.create({
      data: {
        merchantId: merchant.id,
        name,
        description,
        category,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        stockQuantity: Number(stockQuantity),
        pickupStart,
        pickupEnd,
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
        status: Number(stockQuantity) > 0 ? "AVAILABLE" : "SOLD_OUT",
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Create surplus item error:", error);
    return NextResponse.json({ error: "Gagal menambahkan paket surplus" }, { status: 500 });
  }
}
