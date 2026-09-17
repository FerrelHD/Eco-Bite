import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const facilities = await prisma.campusFacility.findMany();
    return NextResponse.json({ facilities });
  } catch (error) {
    console.error("Fetch facilities error:", error);
    return NextResponse.json({ error: "Gagal memuat peta fasilitas kampus" }, { status: 500 });
  }
}
