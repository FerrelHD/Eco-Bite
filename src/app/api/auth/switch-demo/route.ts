import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json(); // "STUDENT", "MERCHANT", "ADMIN"

    let targetEmail = "mahasiswa@ecobite.ac.id";
    if (role === "MERCHANT") {
      targetEmail = "kulina@ecobite.ac.id";
    } else if (role === "ADMIN") {
      targetEmail = "admin@ecobite.ac.id";
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { merchants: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun demo tidak ditemukan" }, { status: 404 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nim: user.nim,
      faculty: user.faculty,
    });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("ecobite_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Switch demo error:", error);
    return NextResponse.json({ error: "Gagal berganti akun demo" }, { status: 500 });
  }
}
