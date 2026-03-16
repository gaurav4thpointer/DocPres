import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const doctor = await prisma.doctor.findUnique({
          where: { email: parsed.data.email },
        });
        if (!doctor) return null;

        const valid = await bcrypt.compare(parsed.data.password, doctor.password);
        if (!valid) return null;

        return {
          id: doctor.id,
          email: doctor.email,
          name: doctor.name,
        };
      },
    }),
  ],
});
