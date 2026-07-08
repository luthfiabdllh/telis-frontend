import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { renameSchema, RenameInput } from "../../schemas/document-schemas";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
  initialName: string;
  type: "folder" | "file";
}

export function RenameModal({ isOpen, onClose, onSubmit, isLoading, initialName, type }: RenameModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RenameInput>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: initialName },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: initialName });
    }
  }, [isOpen, initialName, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {type === "folder" ? "Folder" : "Document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => onSubmit(data.name))} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">New Name</Label>
            <Input id="name" {...register("name")} autoFocus />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
