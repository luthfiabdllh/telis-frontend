import { Button } from "@/components/ui/button";
import { FolderPlus, UploadCloud, LayoutGrid, List as ListIcon } from "lucide-react";
import { DriveBreadcrumb } from "./drive-breadcrumb";
import { Folder } from "../api/document-api";
import { DriveSearch } from "./drive-search";

interface DriveActionBarProps {
  path: Folder[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  documentType: string;
  onDocumentTypeChange: (type: string) => void;
  riskLevel: string;
  onRiskLevelChange: (value: string) => void;
  vendorName: string;
  onVendorNameChange: (value: string) => void;
  businessUnit: string;
  onBusinessUnitChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
  isSearch?: boolean;
}

export function DriveActionBar({
  path,
  viewMode,
  onViewModeChange,
  onCreateFolderClick,
  onUploadClick,
  isSearch,
}: DriveActionBarProps) {
  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;

  return (
    <div className="flex flex-col mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        
        <div className="flex-1 flex justify-center w-full md:max-w-2xl px-0 md:px-4">
          <DriveSearch currentFolderId={currentFolderId} />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-muted rounded-md p-1 mx-2">
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
      <DriveBreadcrumb path={path} isSearch={isSearch} />
    </div>
  );
}
