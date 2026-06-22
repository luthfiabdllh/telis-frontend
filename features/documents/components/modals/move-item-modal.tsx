import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { documentApi } from "../../api/document-api";
import { FolderIcon, ChevronRight, CornerLeftUp, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderId: string | null) => void;
  isLoading: boolean;
  itemName: string;
}

export function MoveItemModal({ isOpen, onClose, onSubmit, isLoading, itemName }: MoveItemModalProps) {
  // Navigation state inside the modal
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Fetch folders for current view
  const { data: folders, isLoading: isFetching } = useQuery({
    queryKey: ["mini-drive", currentFolderId],
    queryFn: () => documentApi.getFolders(currentFolderId),
    enabled: isOpen,
  });

  // Fetch breadcrumb for the 'Go Up' button logic
  const { data: path } = useQuery({
    queryKey: ["mini-drive-path", currentFolderId],
    queryFn: () => documentApi.getFolderPath(currentFolderId as string),
    enabled: isOpen && !!currentFolderId,
  });

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentFolderId(null);
    }
  }, [isOpen]);

  const handleGoUp = () => {
    if (!path || path.length <= 1) {
      setCurrentFolderId(null);
    } else {
      // Go to parent of current
      const parent = path[path.length - 2];
      setCurrentFolderId(parent.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move &quot;{itemName}&quot;</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <span className="truncate max-w-[200px]">
              Current: {currentFolderId ? path?.[path.length - 1]?.name || 'Loading...' : 'Root'}
            </span>
            {currentFolderId && (
              <Button variant="ghost" size="sm" onClick={handleGoUp} className="h-6 px-2 text-xs">
                <CornerLeftUp className="w-3 h-3 mr-1" />
                Go Up
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {isFetching ? (
              <div className="flex justify-center items-center h-full">Loading...</div>
            ) : folders?.length === 0 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                No subfolders
              </div>
            ) : (
              <div className="space-y-1">
                {folders?.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="w-4 h-4 text-primary/70" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSubmit(currentFolderId)} disabled={isLoading}>
            {isLoading ? "Moving..." : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Move Here
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
