import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"

// Simulasi fungsi refresh token ke API Golang
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Nanti ganti dengan fetch() ke http://localhost:8000/auth/refresh
    console.log("Mencoba refresh token...")
    
    // Simulasi respons sukses dari server
    const refreshedTokens = {
      accessToken: "mock-jwt-token-xyz-123-REFRESHED-" + Math.floor(Math.random() * 1000),
      refreshToken: token.refreshToken ?? "mock-refresh-token",
      expiresIn: 15 * 60, // 15 menit dalam detik
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
    }
  } catch (error) {
    console.error("Error refreshing access token", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@telis.id" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // MOCK LOGIN FOR DEVELOPMENT
        if (credentials?.email === "admin@telis.id" && credentials?.password === "admin123") {
          return {
            id: "1",
            name: "Admin TELIS",
            email: "admin@telis.id",
            role: "Admin",
            accessToken: "mock-jwt-token-xyz-123", // Simulasi JWT dari Golang
            refreshToken: "mock-refresh-token-7days",
            expiresAt: Date.now() + 15 * 60 * 1000, // Kedaluwarsa dalam 15 menit
          }
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 1. Initial Sign In
      if (user) {
        return {
          ...token,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        }
      }

      // 2. Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // 3. Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // Sesi (termasuk refresh token) berlaku selama 7 Hari
  }
})
