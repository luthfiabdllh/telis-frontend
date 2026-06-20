"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "../hooks/use-login"
import { Scale } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form, error, isLoading, onSubmit } = useLogin()
  const { register, formState: { errors } } = form

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden shadow-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Section */}
          <form onSubmit={onSubmit} className="p-8 flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center lg:hidden">
                <Scale className="h-10 w-10 text-zinc-900 dark:text-zinc-100 mb-2" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Selamat Datang</h1>
                <p className="text-balance text-zinc-500 text-sm">
                  Silakan masuk menggunakan kredensial Admin Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@telis.id"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-xs underline-offset-2 hover:underline text-zinc-500"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    {...register("password")} 
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isLoading} 
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
                  </div>
                )}
                
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-zinc-500">
                Gunakan <span className="font-semibold text-zinc-700 dark:text-zinc-300">admin@telis.id</span> dan <span className="font-semibold text-zinc-700 dark:text-zinc-300">admin123</span>
              </div>
            </div>
          </form>

          {/* Visual Section (Only visible on MD and up inside the card) */}
          <div className="relative hidden bg-zinc-950 md:flex flex-col items-center justify-center p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0" />
            <div className="relative z-10 text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="bg-zinc-800/50 p-4 rounded-full backdrop-blur-sm border border-zinc-700">
                  <Scale className="h-12 w-12 text-zinc-100" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">TELIS</h2>
              <p className="text-zinc-400 text-sm max-w-[200px] mx-auto">
                Platform AI Enterprise untuk Analisis Dokumen Hukum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-zinc-500 px-6">
        Dengan masuk, Anda menyetujui <a href="#" className="underline hover:text-zinc-900 dark:hover:text-zinc-300">Ketentuan Layanan</a> dan <a href="#" className="underline hover:text-zinc-900 dark:hover:text-zinc-300">Kebijakan Privasi</a> kami.
      </div>
    </div>
  )
}
