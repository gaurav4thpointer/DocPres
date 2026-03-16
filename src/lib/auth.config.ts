import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no bcrypt / Node.js-only modules)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isPrint = nextUrl.pathname.startsWith("/print");
      const isUploads = nextUrl.pathname.startsWith("/uploads");

      if (isApiAuth || isPrint || isUploads) return true;
      if (!isLoggedIn && !isAuthPage) return false;
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
};
