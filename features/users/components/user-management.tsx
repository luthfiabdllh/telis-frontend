"use client";

import { useState } from "react";
import { UserTable } from "./user-table";
import { useUsers, useUpdateUserStatus } from "../hooks/use-users";
import { User } from "../api/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateUserModal } from "./modals/create-user-modal";
import { ChangeRoleModal } from "./modals/change-role-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmActionModal } from "@/features/documents/components/modals/confirm-action-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface UserManagementProps {
  currentUserId?: string;
}

export function UserManagement({ currentUserId }: UserManagementProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [banConfirmUser, setBanConfirmUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers({
    page,
    limit: 10,
    search: search.length > 2 ? search : undefined,
    role_id: roleFilter !== "all" ? parseInt(roleFilter) : undefined,
    is_banned: statusFilter !== "all" ? statusFilter === "banned" : undefined,
  });

  const updateStatus = useUpdateUserStatus();

  const handleBanToggle = async () => {
    if (!banConfirmUser) return;
    try {
      const isCurrentlyBanned = banConfirmUser.is_banned;
      await updateStatus.mutateAsync({ userId: banConfirmUser.id, isBanned: !isCurrentlyBanned });
      toast.success(isCurrentlyBanned ? "Pengguna berhasil di-unban" : "Pengguna berhasil di-ban");
      setBanConfirmUser(null);
    } catch (err: unknown) {
      toast.error("Gagal mengubah status pengguna", { description: (err as Error).message });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center w-full gap-2">
          <div className="relative w-full sm:max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-8 w-full"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] sm:w-[150px]">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">User</SelectItem>
                <SelectItem value="3">Legal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] sm:w-[150px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="p-4 text-center text-destructive border rounded-md">
          Gagal memuat data pengguna. Pastikan Anda adalah Admin.
        </div>
      ) : (
        <>
          <UserTable 
            users={data?.data || []} 
            currentUserId={currentUserId}
            onChangeRole={(u) => setRoleModalUser(u)}
            onBanToggle={(u) => setBanConfirmUser(u)}
          />
          
          {/* Pagination Controls */}
          {data?.meta && data.meta.total > 10 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((page - 1) * 10) + 1} - {Math.min(page * 10, data.meta.total)} dari {data.meta.total} pengguna
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 10 >= data.meta.total}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      <ChangeRoleModal 
        isOpen={!!roleModalUser} 
        onClose={() => setRoleModalUser(null)} 
        user={roleModalUser} 
      />

      {banConfirmUser && (
        <ConfirmActionModal
          isOpen={!!banConfirmUser}
          onClose={() => setBanConfirmUser(null)}
          onConfirm={handleBanToggle}
          isLoading={updateStatus.isPending}
          action={banConfirmUser.is_banned ? "restore" : "deprecate"} 
          // reusing UI: 'restore' gives green refresh icon, 'deprecate' gives amber ban icon
          itemName={banConfirmUser.email}
          itemType="file" // dummy
        />
      )}
    </div>
  );
}
