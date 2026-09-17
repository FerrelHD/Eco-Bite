import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "ecobite-jwt-secure-secret-key-2026";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
  nim?: string | null;
  faculty?: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nim: user.nim,
      faculty: user.faculty,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("ecobite_session")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function validateMerchantOwnership(userId: string, merchantId: string): Promise<boolean> {
  const merchant = await prisma.merchant.findFirst({
    where: {
      id: merchantId,
      userId: userId,
    },
  });
  return !!merchant;
}
