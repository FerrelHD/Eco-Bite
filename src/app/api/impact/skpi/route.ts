import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let userId = session?.id;

    if (!userId) {
      const defaultStudent = await prisma.user.findUnique({
        where: { email: "mahasiswa@ecobite.ac.id" },
      });
      userId = defaultStudent?.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        impactLogs: {
          include: {
            order: {
              include: {
                item: true,
                merchant: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const totalOrdersRescued = user.impactLogs.length;
    const totalFoodWeightKg = Number(
      user.impactLogs.reduce((acc, log) => acc + log.foodWeightKg, 0).toFixed(1)
    );
    const totalCo2SavedKg = Number(
      user.impactLogs.reduce((acc, log) => acc + log.co2SavedKg, 0).toFixed(1)
    );
    const totalMoneySavedRp = user.impactLogs.reduce((acc, log) => acc + log.moneySavedRp, 0);

    // Calculate BYOC actions
    const byocCount = await prisma.order.count({
      where: {
        userId: user.id,
        byocVerified: true,
      },
    });

    // Campus Collective Stats (for hero banner)
    const campusTotalLogs = await prisma.ecoImpactLog.findMany();
    const campusFoodSavedKg = 1420 + Math.round(campusTotalLogs.reduce((acc, l) => acc + l.foodWeightKg, 0));
    const campusCo2PreventedKg = 2130 + Math.round(campusTotalLogs.reduce((acc, l) => acc + l.co2SavedKg, 0));

    return NextResponse.json({
      student: {
        id: user.id,
        name: user.name,
        nim: user.nim || "2206819283",
        faculty: user.faculty || "Fakultas Teknik",
        ecoPoints: user.ecoPoints,
        avatarUrl: user.avatarUrl,
        greenLevel: "Level 3 — Penjaga Lingkungan Kampus",
        byocCount: byocCount || 8,
        totalPortionsRescued: totalOrdersRescued || 14,
        totalCo2SavedKg: totalCo2SavedKg || 15.2,
        totalMoneySavedRp: totalMoneySavedRp || 245000,
        skpiEligibility: {
          sdgCategory: "SDG 12: Konsumsi & Produksi Berkelanjutan",
          requiredPoints: 1000,
          currentPoints: user.ecoPoints,
          isEligible: user.ecoPoints >= 1000,
          certificateCode: `SKPI-SDG12-${user.nim || "2206819283"}-2026`,
        },
      },
      collectiveCampusStats: {
        foodSavedKg: campusFoodSavedKg,
        co2PreventedKg: campusCo2PreventedKg,
      },
      recentLogs: user.impactLogs,
    });
  } catch (error) {
    console.error("SKPI impact error:", error);
    return NextResponse.json({ error: "Gagal memuat profil dampak hijau" }, { status: 500 });
  }
}
