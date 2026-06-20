import axios from "axios"
import { getSession, signOut } from "next-auth/react"

// Tentukan baseURL backend Golang Anda
// Sebaiknya ini diletakkan di .env.local (contoh: NEXT_PUBLIC_API_URL=http://localhost:8000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // getSession() aman dipanggil di Client Component dan secara otomatis me-refresh token jika hampir kedaluwarsa
    const session = await getSession()
    
    // Jika ada error refresh token dari NextAuth (sesi benar-benar habis/7 hari berlalu)
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" })
      return Promise.reject(new Error("Sesi telah berakhir. Silakan login kembali."))
    }

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Menangani Global Error (misalnya 401 Unauthorized dari Backend Golang)
    if (error.response?.status === 401) {
      console.warn("API membalas 401 Unauthorized. Kredensial tidak valid.")
      // Opsional: Anda bisa memaksa signOut di sini jika memang backend menolak token secara sepihak
      // signOut({ callbackUrl: "/login" })
    }
    
    return Promise.reject(error)
  }
)
