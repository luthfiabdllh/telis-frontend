import { Button } from "@/components/ui/button";
import { FolderPlus, UploadCloud } from "lucide-react";
import { DriveBreadcrumb } from "./drive-breadcrumb";
import { Folder } from "../schemas/document-schemas";

interface DriveActionBarProps {
  path: Folder[];
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
  isSearch?: boolean;
}

export function DriveActionBar({
  path,
  onCreateFolderClick,
  onUploadClick,
  isSearch,
}: DriveActionBarProps) {
  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;

  return (
    <div className="flex flex-col mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <DriveBreadcrumb path={path} isSearch={isSearch} />
        
        <div className="flex-1" />

        <div className="flex w-full md:w-auto items-center space-x-2">
          <Button variant="outline" onClick={onCreateFolderClick} className="flex-1 md:flex-none">
            <FolderPlus className="h-4 w-4 mr-2" />
            <span className="truncate">New Folder</span>
          </Button>
          <Button onClick={onUploadClick} className="flex-1 md:flex-none">
            <UploadCloud className="h-4 w-4 mr-2" />
            <span className="truncate">Upload</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
