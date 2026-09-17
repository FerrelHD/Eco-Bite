import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      // Return default student preview if not logged in
      const defaultStudent = await prisma.user.findUnique({
        where: { email: "mahasiswa@ecobite.ac.id" },
        include: { merchants: true },
      });
      return NextResponse.json({ user: defaultStudent });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        merchants: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
