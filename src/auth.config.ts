import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname.startsWith("/sign-in") ||
        nextUrl.pathname.startsWith("/sign-up") ||
        nextUrl.pathname.startsWith("/forgot-password")
      const isLandingPage = nextUrl.pathname.startsWith("/landing")

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (isLandingPage) {
        return true
      }

      // For all other pages (including / and dashboard pages), require login
      return isLoggedIn
    },
  },
  providers: [], // Will be populated with actual providers in auth.ts
} satisfies NextAuthConfig
