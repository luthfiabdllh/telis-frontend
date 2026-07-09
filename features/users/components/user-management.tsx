"use client";

import { useState, useMemo } from "react";
import { UserTable } from "./user-table";
import { useUsers, useUpdateUserStatus, useUserMetrics } from "../hooks/use-users";
import { User } from "../api/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, ShieldAlert, Filter, Activity, UserX } from "lucide-react";
import { CreateUserModal } from "./modals/create-user-modal";
import { ChangeRoleModal } from "./modals/change-role-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmActionModal } from "@/features/documents/components/modals/confirm-action-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

  const { data: metrics } = useUserMetrics();

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

  const totalPages = data?.meta?.last_page || (data?.meta ? Math.ceil(data.meta.total / 10) : 1);

  const generatePaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (page > totalPages - 3) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-1/10 text-chart-1">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
              <h3 className="text-2xl font-bold">{metrics?.total_users ?? (data?.meta?.total || 0)}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10 text-chart-2">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pengguna Aktif</p>
              <h3 className="text-2xl font-bold">{metrics?.active_users ?? 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pengguna Banned</p>
              <h3 className="text-2xl font-bold">{metrics?.banned_users ?? 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-3/10 text-chart-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Admin</p>
              <h3 className="text-2xl font-bold">{metrics?.total_admins ?? 0}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Glassmorphic Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-2xl border bg-card/50 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center w-full gap-3">
          <div className="relative w-full sm:max-w-[320px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama pengguna atau email..."
              className="pl-9 w-full bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/50 transition-all rounded-xl"
              value={search}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-background/50 rounded-xl border border-muted-foreground/20 px-1">
              <Filter className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
              <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0 bg-transparent">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">User</SelectItem>
                  <SelectItem value="3">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center bg-background/50 rounded-xl border border-muted-foreground/20 px-1">
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 bg-transparent">
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
        </div>
        
        <Button 
          className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all" 
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
        </Button>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-destructive/5 text-destructive border border-destructive/20 rounded-2xl flex flex-col items-center justify-center">
          <ShieldAlert className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-semibold text-lg">Gagal Memuat Data</h3>
          <p className="text-sm opacity-90 mt-1">Pastikan Anda memiliki izin akses sebagai Admin.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
          <UserTable 
            users={data?.data || []} 
            currentUserId={currentUserId}
            onChangeRole={(u) => setRoleModalUser(u)}
            onBanToggle={(u) => setBanConfirmUser(u)}
          />
          
          {/* Advanced Pagination Controls */}
          {data?.meta && data.meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border">
                Menampilkan <span className="font-medium text-foreground">{((page - 1) * 10) + 1}</span> - <span className="font-medium text-foreground">{Math.min(page * 10, data.meta.total)}</span> dari <span className="font-medium text-foreground">{data.meta.total}</span> pengguna
              </div>
              
              {totalPages > 1 && (
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={(data?.meta?.has_prev !== undefined ? !data.meta.has_prev : page === 1) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {generatePaginationNumbers().map((pageNum, idx) => (
                      <PaginationItem key={idx}>
                        {pageNum === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink 
                            isActive={page === pageNum}
                            onClick={() => setPage(pageNum as number)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={(data?.meta?.has_next !== undefined ? !data.meta.has_next : page === totalPages) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </motion.div>
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
          itemName={banConfirmUser.email}
          itemType="file" // dummy
        />
      )}
    </div>
  );
}
