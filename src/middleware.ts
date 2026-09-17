import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ecobite-jwt-secure-secret-key-2026"
);

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("ecobite_session")?.value;

  let session: TokenPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as unknown as TokenPayload;
    } catch {
      session = null;
    }
  }

  // 1. Guard Admin Routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (session.role !== "ADMIN") {
      // Forbidden: redirect to home or merchant depending on role
      const redirectTarget = session.role === "MERCHANT" ? "/merchant" : "/";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }
  }

  // 2. Guard Merchant Routes
  if (pathname.startsWith("/merchant") && pathname !== "/merchant/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/merchant/login", req.url));
    }
    if (session.role !== "MERCHANT" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 3. Prevent logged-in users from seeing redundant login pages
  if (pathname === "/admin/login" && session?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (pathname === "/merchant/login" && (session?.role === "MERCHANT" || session?.role === "ADMIN")) {
    return NextResponse.redirect(new URL("/merchant", req.url));
  }
  if (pathname === "/login" && session?.role === "STUDENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/login",
  ],
};
