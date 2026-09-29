import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

// API routes are excluded: they enforce auth themselves and return JSON 401s.
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
