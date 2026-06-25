import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateUserRole } from "../../hooks/use-users";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { User } from "../../api/user-api";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ChangeRoleModal({ isOpen, onClose, user }: ChangeRoleModalProps) {
  const [roleId, setRoleId] = useState<string>("2");
  const updateRole = useUpdateUserRole();

  useEffect(() => {
    if (user && isOpen) {
      setRoleId(user.role_id.toString());
    }
  }, [user, isOpen]);

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await updateRole.mutateAsync({ userId: user.id, roleId: parseInt(roleId) });
      toast.success("Wewenang pengguna berhasil diubah");
      onClose();
    } catch (err: unknown) {
      toast.error("Gagal mengubah wewenang", { description: (err as Error).message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Wewenang Pengguna</DialogTitle>
          <DialogDescription>
            Pilih wewenang baru untuk <strong>{user?.username}</strong> ({user?.email}).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Role Baru</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih wewenang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">User</SelectItem>
                <SelectItem value="3">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateRole.isPending}>Batal</Button>
          <Button onClick={handleSubmit} disabled={updateRole.isPending || (user ? user.role_id.toString() === roleId : false)}>
            {updateRole.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
