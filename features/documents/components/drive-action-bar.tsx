import { Button } from "@/components/ui/button";
import { FolderPlus, UploadCloud, LayoutGrid, List as ListIcon } from "lucide-react";
import { DriveBreadcrumb } from "./drive-breadcrumb";
import { Folder } from "../api/document-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { DriveSearch } from "./drive-search";

const CATEGORIES = [
  "ALL", "NDA", "PROCUREMENT_CONTRACT", "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT", "REGULATORY_DOCUMENT", "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY", "LEGAL_CORRESPONDENCE", "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT", "OTHER"
];


interface DriveActionBarProps {
  path: Folder[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  documentType: string;
  onDocumentTypeChange: (type: string) => void;
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
}

export function DriveActionBar({
  path,
  viewMode,
  onViewModeChange,
  documentType,
  onDocumentTypeChange,
  onCreateFolderClick,
  onUploadClick,
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
          <Select value={documentType} onValueChange={onDocumentTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === "ALL" ? "Semua Kategori" : c}</SelectItem>)}
            </SelectContent>
          </Select>

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
      <DriveBreadcrumb path={path} />
    </div>
  );
}
