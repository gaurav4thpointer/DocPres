import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16 "proxy" replaces middleware filename; keep this Edge-safe (no Prisma/bcrypt).
 * Full providers + credentials live in `lib/auth.ts`.
 */
const { auth } = NextAuth(authConfig);
export { auth as proxy };

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
