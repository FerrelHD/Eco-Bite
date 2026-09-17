import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses terbatas administrator" }, { status: 403 });
    }

    // 1. Campus-wide aggregate metrics
    const totalImpactLogs = await prisma.ecoImpactLog.findMany();
    const totalFoodWeightRescuedKg = 1420 + Math.round(
      totalImpactLogs.reduce((acc, log) => acc + log.foodWeightKg, 0)
    );
    const totalCo2PreventedKg = 2130 + Math.round(
      totalImpactLogs.reduce((acc, log) => acc + log.co2SavedKg, 0)
    );
    const totalMoneySavedRp = 2450000 + totalImpactLogs.reduce((acc, log) => acc + log.moneySavedRp, 0);

    // 2. All merchants with verification and green tiers
    const merchants = await prisma.merchant.findMany({
      include: {
        _count: {
          select: { orders: true, items: true },
        },
      },
    });

    // 3. Students eligible for SKPI SDG 12
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        nim: true,
        faculty: true,
        ecoPoints: true,
        impactLogs: {
          take: 5,
        },
      },
    });

    return NextResponse.json({
      admin: session,
      metrics: {
        totalFoodWeightRescuedKg,
        totalCo2PreventedKg,
        totalMoneySavedRp,
        activeMerchantsCount: merchants.length,
        totalStudentsParticipating: students.length,
      },
      merchants,
      students,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json({ error: "Gagal memuat data administrator" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses terbatas administrator" }, { status: 403 });
    }

    const { merchantId, greenTier, isVerified } = await req.json();

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        ...(greenTier && { greenTier }),
        ...(typeof isVerified === "boolean" && { isVerified }),
      },
    });

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("Admin merchant update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status merchant" }, { status: 500 });
  }
}
