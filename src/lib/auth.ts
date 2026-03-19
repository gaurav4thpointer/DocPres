import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createImpersonationToken(clinicId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "secret");
  return new SignJWT({ clinicId, purpose: "impersonate" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1m")
    .sign(secret);
}

async function verifyImpersonationToken(token: string): Promise<{ clinicId: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "impersonate" || !payload.clinicId) return null;
    return { clinicId: payload.clinicId as string };
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 1. Try Admin
        const admin = await prisma.admin.findUnique({
          where: { email },
        });
        if (admin) {
          const valid = await bcrypt.compare(password, admin.password);
          if (valid) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name ?? "Admin",
              role: UserRole.ADMIN,
              clinicId: null,
            };
          }
          return null;
        }

        // 2. Try Clinic
        const clinic = await prisma.clinic.findFirst({
          where: { email, isActive: true },
        });
        if (clinic) {
          const valid = await bcrypt.compare(password, clinic.password);
          if (valid) {
            return {
              id: clinic.id,
              email: clinic.email,
              name: clinic.name,
              role: UserRole.CLINIC,
              clinicId: clinic.id,
            };
          }
          return null;
        }

        // 3. Try Doctor (email can repeat across clinics)
        const doctor = await prisma.doctor.findFirst({
          where: { email, isActive: true },
          include: { clinic: true },
        });
        if (doctor) {
          const valid = await bcrypt.compare(password, doctor.password);
          if (valid) {
            return {
              id: doctor.id,
              email: doctor.email,
              name: doctor.name,
              role: UserRole.DOCTOR,
              clinicId: doctor.clinicId,
            };
          }
        }

        return null;
      },
    }),
    Credentials({
      id: "impersonate",
      name: "impersonate",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        const payload = await verifyImpersonationToken(token);
        if (!payload) return null;

        const clinic = await prisma.clinic.findUnique({
          where: { id: payload.clinicId, isActive: true },
        });
        if (!clinic) return null;

        return {
          id: clinic.id,
          email: clinic.email,
          name: clinic.name,
          role: UserRole.CLINIC,
          clinicId: clinic.id,
        };
      },
    }),
  ],
});
