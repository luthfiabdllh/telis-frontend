import { Metadata } from "next";

import { auth } from "@/auth";
import { UserManagement } from "@/features/users/components/user-management";

export const metadata: Metadata = {
  title: "Manajemen Pengguna - TELIS",
  description: "Kelola pengguna, wewenang, dan akses sistem.",
};

export default async function UsersPage() {
  const session = await auth();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pengelolaan Pengguna</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <UserManagement currentUserId={session?.user?.id} />
      </div>
    </div>
  );
}
