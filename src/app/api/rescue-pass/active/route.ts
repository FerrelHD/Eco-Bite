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

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active pass or latest confirmed order
    const activeOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: { in: ["CONFIRMED", "READY_FOR_PICKUP"] },
      },
      include: {
        item: true,
        merchant: true,
        rescuePass: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also fetch completed orders history for this user
    const history = await prisma.order.findMany({
      where: {
        userId,
        orderStatus: "COMPLETED",
      },
      include: {
        item: true,
        merchant: true,
        impactLog: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      activeOrder,
      history,
    });
  } catch (error) {
    console.error("Get active pass error:", error);
    return NextResponse.json({ error: "Gagal memuat tiket aktif" }, { status: 500 });
  }
}
