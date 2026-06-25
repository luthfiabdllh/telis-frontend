import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Ban, RefreshCw, Info } from "lucide-react";

export type ConfirmActionType = "delete" | "deprecate" | "restore";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  action: ConfirmActionType;
  itemName: string;
  itemType: "folder" | "file";
}

export function ConfirmActionModal({ isOpen, onClose, onConfirm, isLoading, action, itemName, itemType }: ConfirmActionModalProps) {
  let title = "";
  let description = "";
  let buttonText = "";
  let buttonVariant: "default" | "destructive" | "outline" | "secondary" = "default";
  let Icon = Info;
  let iconColor = "";

  switch (action) {
    case "delete":
      title = `Delete ${itemType === "folder" ? "Folder" : "Document"}`;
      description = `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`;
      buttonText = "Delete";
      buttonVariant = "destructive";
      Icon = Trash2;
      iconColor = "text-destructive";
      break;
    case "deprecate":
      title = "Deprecate Document";
      description = `Are you sure you want to deprecate "${itemName}"? It will no longer be used for AI reasoning, but the file will be kept.`;
      buttonText = "Deprecate";
      buttonVariant = "default";
      Icon = Ban;
      iconColor = "text-amber-600";
      break;
    case "restore":
      title = "Restore Document";
      description = `Are you sure you want to restore "${itemName}"? It will be re-processed by the AI and made available for reasoning again.`;
      buttonText = "Restore";
      buttonVariant = "default";
      Icon = RefreshCw;
      iconColor = "text-teal-600";
      break;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-muted/50 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-base text-foreground/80">
            {description}
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant={buttonVariant} 
            onClick={onConfirm} 
            disabled={isLoading}
            className={
              action === "deprecate" 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : action === "restore" 
                  ? "bg-teal-600 hover:bg-teal-700 text-white" 
                  : ""
            }
          >
            {isLoading ? "Processing..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
