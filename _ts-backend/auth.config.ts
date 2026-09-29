import type { NextAuthConfig } from "next-auth";

const PROTECTED = ["/dashboard", "/transactions", "/budgets", "/categories", "/recurring", "/analytics", "/settings"];

/** Edge-safe config (no Prisma/bcrypt) shared by middleware and the full auth setup. */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) return loggedIn;
      if (loggedIn && (path === "/login" || path === "/register")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      return session;
    },
  },
} satisfies NextAuthConfig;
