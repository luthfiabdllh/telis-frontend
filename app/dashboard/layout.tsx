import { ReactNode } from "react"
import { auth, signOut } from "@/auth"
import { Scale, LogOut, Home, FileText, Settings, ShieldCheck } from "lucide-react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Scale className="h-6 w-6 mr-2 text-zinc-900 dark:text-zinc-100" />
          <span className="font-bold text-lg tracking-tight">TELIS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 transition-colors">
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 transition-colors">
            <FileText className="h-4 w-4 mr-3" />
            Dokumen Hukum
          </a>
          {session?.user?.role === "Admin" && (
             <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 transition-colors">
               <ShieldCheck className="h-4 w-4 mr-3" />
               Panel Admin
             </a>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button type="submit" className="mt-2 flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="h-4 w-4 mr-3" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:hidden">
          <div className="flex items-center">
            <Scale className="h-6 w-6 mr-2 text-zinc-900 dark:text-zinc-100" />
            <span className="font-bold">TELIS</span>
          </div>
          {/* Mobile Menu Toggle Here */}
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
