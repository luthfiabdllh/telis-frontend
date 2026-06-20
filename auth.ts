import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Fungsi utilitas untuk men-decode JWT di Node.js
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(jsonPayload)
  } catch (e) {
    return {}
  }
}

// Fungsi refresh token ke API Golang
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken })
    })

    if (!res.ok) throw new Error("Gagal me-refresh token")

    const data = await res.json()
    const decoded = decodeJwt(data.access_token)

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || token.refreshToken,
      expiresAt: decoded.exp ? decoded.exp * 1000 : Date.now() + 15 * 60 * 1000,
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
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
        email: { label: "Email", type: "email", placeholder: "user@telis.id" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          const data = await res.json()

          if (!res.ok || !data.access_token) {
            return null // Jika 401 Unauthorized, kembalikan null agar NextAuth melempar CredentialsSignin
          }

          const decoded = decodeJwt(data.access_token)

          return {
            id: decoded.sub || decoded.user_id || "1",
            email: decoded.email || credentials.email,
            name: decoded.name || decoded.username || "User TELIS",
            role: decoded.role || "User",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: decoded.exp ? decoded.exp * 1000 : Date.now() + 15 * 60 * 1000,
          }
        } catch (error) {
          console.error("Login API Error:", error)
          return null
        }
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
