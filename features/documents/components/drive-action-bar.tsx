import { Button } from "@/components/ui/button";
import { FolderPlus, UploadCloud, LayoutGrid, List as ListIcon } from "lucide-react";
import { DriveBreadcrumb } from "./drive-breadcrumb";
import { Folder } from "../api/document-api";

interface DriveActionBarProps {
  path: Folder[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
}

export function DriveActionBar({
  path,
  viewMode,
  onViewModeChange,
  onCreateFolderClick,
  onUploadClick,
}: DriveActionBarProps) {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-end mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Documents</h1>
        <DriveBreadcrumb path={path} />
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-muted rounded-md p-1 mr-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" onClick={onCreateFolderClick}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button onClick={onUploadClick}>
          <UploadCloud className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
}
