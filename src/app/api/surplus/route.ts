import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const faculty = searchParams.get("faculty");
    const query = searchParams.get("q");

    const where: any = {
      status: "AVAILABLE",
      merchant: {
        isOpen: true,
      },
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (faculty && faculty !== "ALL") {
      where.merchant = {
        ...where.merchant,
        faculty: faculty,
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { merchant: { storeName: { contains: query } } },
      ];
    }

    const items = await prisma.surplusItem.findMany({
      where,
      include: {
        merchant: {
          select: {
            id: true,
            storeName: true,
            location: true,
            faculty: true,
            isOpen: true,
            isVerified: true,
            greenTier: true,
            coordinatesLat: true,
            coordinatesLng: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Fetch surplus items error:", error);
    return NextResponse.json({ error: "Gagal memuat katalog makanan surplus" }, { status: 500 });
  }
}
