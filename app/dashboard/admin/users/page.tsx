import { Metadata } from "next";

import { auth } from "@/auth";
import { UserManagement } from "@/features/users/components/user-management";
import { UsersIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Manajemen Pengguna - TELIS",
  description: "Kelola pengguna, wewenang, dan akses sistem.",
};

export default async function UsersPage() {
  const session = await auth();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Pengelolaan Pengguna
        </h2>
      </div>
      <div className="flex-1 flex-col space-y-8 flex w-full">
        <UserManagement currentUserId={session?.user?.id} />
      </div>
    </div>
  );
}
