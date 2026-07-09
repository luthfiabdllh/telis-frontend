import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldAlert, ShieldCheck, Ban, UserCog, User as UserIcon } from "lucide-react";
import { User } from "../api/user-api";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none px-2 py-0.5">{roleName}</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20 shadow-none px-2 py-0.5">{roleName}</Badge>;
      default:
        return <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20 shadow-none px-2 py-0.5">{roleName}</Badge>;
    }
  };

  const getStatusBadge = (isBanned: boolean) => {
    if (isBanned) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none px-2 py-0.5"><Ban className="w-3 h-3 mr-1" /> Banned</Badge>;
    }
    return <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20 shadow-none px-2 py-0.5"><ShieldCheck className="w-3 h-3 mr-1" /> Active</Badge>;
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-muted-foreground w-[300px]">Pengguna</TableHead>
            <TableHead className="font-semibold text-muted-foreground hidden md:table-cell">Kontak</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Wewenang</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="font-semibold text-muted-foreground hidden md:table-cell">Bergabung</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UserIcon className="h-8 w-8 opacity-20" />
                  <p>Tidak ada data pengguna yang ditemukan.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow 
                key={user.id} 
                className={`transition-colors hover:bg-muted/50 ${user.id === currentUserId ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <TableCell className="font-medium py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-background shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2">
                        {user.username}
                        {user.id === currentUserId && (
                          <Badge className="text-[9px] bg-primary/20 text-primary hover:bg-primary/20 px-1.5 py-0 shadow-none border-none uppercase tracking-wider">Anda</Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal md:hidden">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role_id, user.role?.name || "User")}</TableCell>
                <TableCell>{getStatusBadge(user.is_banned)}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                  {format(new Date(user.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">Tindakan</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onChangeRole(user)}
                        disabled={user.id === currentUserId}
                        className="cursor-pointer rounded-md my-1"
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Ubah Role</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onBanToggle(user)}
                        disabled={user.id === currentUserId}
                        className={`cursor-pointer rounded-md my-1 ${user.is_banned ? "text-chart-2 focus:text-chart-2 focus:bg-chart-2/10" : "text-destructive focus:text-destructive focus:bg-destructive/10"}`}
                      >
                        {user.is_banned ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                        <span>{user.is_banned ? "Pulihkan Akses" : "Tangguhkan Akses"}</span>
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
