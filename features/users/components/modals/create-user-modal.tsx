import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Dices } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUser } from "../../hooks/use-users";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role_id: z.string().min(1, "Role is required"),
});

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const createUser = useCreateUser();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", password: "", role_id: "2" },
  });

  const roleValue = watch("role_id");

  useEffect(() => {
    if (isOpen) {
      reset({ username: "", email: "", password: "", role_id: "2" });
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", pass, { shouldValidate: true });
    setShowPassword(true); // Show it so admin can copy it
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createUser.mutateAsync({
        ...data,
        role_id: parseInt(data.role_id)
      });
      toast.success("Pengguna berhasil dibuat");
      onClose();
    } catch (err: unknown) {
      toast.error("Gagal membuat pengguna", { description: (err as Error).message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah ini untuk menambahkan pengguna ke dalam sistem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="johndoe" {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="******" 
                  {...register("password")} 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Password">
                <Dices className="h-4 w-4" />
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            <p className="text-[11px] text-muted-foreground">Admin dapat mengatur kata sandi awal jika pengguna tidak masuk menggunakan SSO.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_id">Role</Label>
            <Select 
              value={roleValue} 
              onValueChange={(val) => setValue("role_id", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih wewenang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">User</SelectItem>
                <SelectItem value="3">Legal</SelectItem>
              </SelectContent>
            </Select>
            {errors.role_id && <p className="text-sm text-destructive">{errors.role_id.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={createUser.isPending}>Batal</Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
