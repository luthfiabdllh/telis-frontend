import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100),
});

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export function CreateFolderModal({ isOpen, onClose, onSubmit, isLoading }: CreateFolderModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => onSubmit(data.name))} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input id="name" placeholder="E.g., Legal Documents 2026" {...register("name")} autoFocus />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
