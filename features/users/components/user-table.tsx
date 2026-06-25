import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldAlert, ShieldCheck, Ban, UserCog } from "lucide-react";
import { User } from "../api/user-api";
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  onChangeRole: (user: User) => void;
  onBanToggle: (user: User) => void;
  currentUserId?: string;
}

export function UserTable({ users, onChangeRole, onBanToggle, currentUserId }: UserTableProps) {
  
  const getRoleBadge = (roleId: number, roleName: string) => {
    switch (roleId) {
      case 1:
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{roleName}</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{roleName}</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">{roleName}</Badge>;
    }
  };

  const getStatusBadge = (isBanned: boolean) => {
    if (isBanned) {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Banned</Badge>;
    }
    return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengguna</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bergabung</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada data pengguna.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.username}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Anda</span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role_id, user.role?.name || "User")}</TableCell>
                <TableCell>{getStatusBadge(user.is_banned)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(user.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onChangeRole(user)}
                        disabled={user.id === currentUserId} // Cannot change own role
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Ubah Role</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onBanToggle(user)}
                        disabled={user.id === currentUserId} // Cannot ban self
                        className={user.is_banned ? "text-green-600 focus:text-green-600" : "text-amber-600 focus:text-amber-600"}
                      >
                        {user.is_banned ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                        <span>{user.is_banned ? "Unban Pengguna" : "Ban Pengguna"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
