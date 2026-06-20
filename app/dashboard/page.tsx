import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Activity, Key } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Selamat datang kembali di sistem TELIS. Berikut ringkasan status Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-500">Status Akses</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">Aktif</div>
            <p className="text-xs text-zinc-500 mt-1">Sesi Anda valid dan terverifikasi.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-500">Role Sistem</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session?.user?.role || "User"}</div>
            <p className="text-xs text-zinc-500 mt-1">Hak akses Anda saat ini.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-500">Metode Login</CardTitle>
            <Key className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Credentials</div>
            <p className="text-xs text-zinc-500 mt-1">Siap untuk migrasi SSO Email.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-950 dark:border-blue-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center">
            Mock Login Berhasil 🎉
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Anda berhasil masuk menggunakan NextAuth.js dengan konfigurasi kredensial simulasi.
            Di tahap selanjutnya, kredensial ini akan dihubungkan dengan API Golang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white/80 dark:bg-zinc-950/80 p-5 rounded-md border text-xs font-mono overflow-auto shadow-inner text-zinc-800 dark:text-zinc-300">
            {JSON.stringify(session, null, 2)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
