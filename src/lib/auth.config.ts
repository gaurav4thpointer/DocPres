import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";

// Edge-compatible auth config (no bcrypt / Node.js-only modules)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? UserRole.DOCTOR;
        token.clinicId = (user as { clinicId?: string }).clinicId ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? UserRole.DOCTOR;
        session.user.clinicId = token.clinicId as string | undefined;
      }
      return session;
    },
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname === "/login";
      const isAdminLogin = nextUrl.pathname.startsWith("/admin/login");
      const isForgotPassword = nextUrl.pathname.startsWith("/forgot-password");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isPrint = nextUrl.pathname.startsWith("/print");
      const isUploads = nextUrl.pathname.startsWith("/uploads");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isResetPassword = nextUrl.pathname.startsWith("/reset-password");

      if (isApiAuth || isPrint || isUploads) return true;
      if (isAdminLogin) return true;
      if (isForgotPassword || isResetPassword) return true;
      if (nextUrl.pathname === "/impersonate") return true;

      // Admin routes require ADMIN role
      if (isAdminRoute) {
        if (!isLoggedIn) return Response.redirect(new URL("/admin/login", nextUrl));
        const role = (auth.user as { role?: UserRole })?.role;
        if (role !== UserRole.ADMIN) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isAuthPage && nextUrl.pathname !== "/impersonate") return false;
      if (isLoggedIn && isAuthPage) {
        const role = (auth.user as { role?: UserRole })?.role;
        if (role === UserRole.ADMIN) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
};
