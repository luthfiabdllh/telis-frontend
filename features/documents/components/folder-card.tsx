import { Folder as FolderIcon, MoreVertical, Pencil, FolderInput, Trash2 } from "lucide-react";
import { Folder } from "../api/document-api";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import FolderGraphic from "./folder";

interface FolderCardProps {
  folder: Folder;
  onRename: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onOpenLocation?: (folder: Folder) => void;
  viewMode: "grid" | "list";
}

export function FolderCard({ folder, onRename, onMove, onDelete, onOpenLocation, viewMode }: FolderCardProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/dashboard/documents?folder_id=${folder.id}`);
  };

  if (viewMode === "list") {
    return (
      <div 
        onClick={handleNavigate}
        className="flex items-center justify-between p-3 border-b hover:bg-muted/50 transition-colors group cursor-pointer"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FolderIcon className="w-5 h-5 fill-current" />
          </div>
          <span className="font-medium">{folder.name}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <FolderActions
            folder={folder}
            onRename={onRename}
            onMove={onMove}
            onDelete={onDelete}
            onOpenLocation={onOpenLocation}
          />
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      onClick={handleNavigate}
      className="relative aspect-square border border-border/50 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 group bg-card/60 backdrop-blur-xl cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="absolute top-2 right-2 z-50" onClick={(e) => e.stopPropagation()}>
        <FolderActions
          folder={folder}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          onOpenLocation={onOpenLocation}
        />
      </div>
      
      <div className="w-full flex-1 relative flex items-center justify-center pointer-events-none mt-2">
        <div className="flex items-center justify-center w-0 h-0">
          <div className="transform scale-[0.4] sm:scale-[0.45] lg:scale-50 group-hover:scale-[0.45] sm:group-hover:scale-[0.5] lg:group-hover:scale-[0.55] transition-transform duration-300">
            <FolderGraphic/>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 w-full text-center relative z-10 bg-linear-to-t from-card/80 to-transparent mt-auto">
        <h3 className="font-semibold text-xs sm:text-sm truncate">{folder.name}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
          {new Date(folder.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function FolderActions({ folder, onRename, onMove, onDelete, onOpenLocation }: Omit<FolderCardProps, "viewMode">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onOpenLocation && (
          <>
            <DropdownMenuItem onClick={() => onOpenLocation(folder)}>
              <FolderInput className="h-4 w-4 mr-2" />
              Tampilkan Lokasi
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => onRename(folder)}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMove(folder)}>
          <FolderInput className="h-4 w-4 mr-2" />
          Move to...
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(folder)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
