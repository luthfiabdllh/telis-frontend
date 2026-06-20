"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Scale } from "lucide-react" 
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password tidak boleh kosong."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setError("Email atau password salah.")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Kiri: Dekorasi Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0" />
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-8">
            <div className="bg-zinc-800/50 p-6 rounded-full backdrop-blur-sm border border-zinc-700">
              <Scale className="h-20 w-20 text-zinc-100" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">TELIS</h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Telkom Legal Intelligence System. Platform AI Enterprise untuk Analisis Dokumen Hukum.
          </p>
        </div>
      </div>

      {/* Kanan: Form Login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900">
        <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <Scale className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Selamat Datang</CardTitle>
            <CardDescription className="text-zinc-500">
              Silakan masuk menggunakan kredensial Admin Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@telis.id"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-medium transition-all" disabled={isLoading}>
                {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t p-6 mt-4 border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-center text-zinc-500">
              Gunakan email <span className="font-semibold text-zinc-700 dark:text-zinc-300">admin@telis.id</span> dan password <span className="font-semibold text-zinc-700 dark:text-zinc-300">admin123</span> untuk mencoba.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
