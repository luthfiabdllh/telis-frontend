import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
    accessToken?: string
    error?: string
  }

  interface User {
    role?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}
