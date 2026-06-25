import { FileText, MoreVertical, Pencil, FolderInput, Trash2, Ban, Download } from "lucide-react";
import { DocumentType } from "../api/document-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileCardProps {
  file: DocumentType;
  onRename: (file: DocumentType) => void;
  onMove: (file: DocumentType) => void;
  onDelete: (file: DocumentType) => void;
  onDeprecate: (file: DocumentType) => void;
  onOpenLocation?: (file: DocumentType) => void;
  viewMode: "grid" | "list";
}

export function formatBytes(bytes?: number | null, decimals = 2) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return 'Unknown Size';
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FileCard({ file, onRename, onMove, onDelete, onDeprecate, onOpenLocation, viewMode }: FileCardProps) {
  const isDeprecated = file.is_deprecated;
  const formattedSize = formatBytes(file.file_size_bytes);

  if (viewMode === "list") {
    return (
      <div className={`flex items-center justify-between p-3 border-b hover:bg-muted/50 transition-colors group ${isDeprecated ? 'opacity-60' : ''}`}>
        <div className="flex items-center space-x-3 flex-1 overflow-hidden">
          <div className={`p-2 rounded-lg ${isDeprecated ? 'bg-muted text-muted-foreground' : 'bg-red-500/10 text-red-500'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col truncate flex-1">
            <span className="font-medium truncate flex items-center gap-2">
              {file.filename}
              {isDeprecated && <Badge variant="secondary" className="text-[10px] h-4">Deprecated</Badge>}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedSize} • {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <FileActions
          file={file}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          onDeprecate={onDeprecate}
          onOpenLocation={onOpenLocation}
        />
      </div>
    );
  }

  // Grid View
  return (
    <div className={`border rounded-xl p-4 hover:shadow-md hover:border-red-500/50 transition-all group bg-card flex flex-col ${isDeprecated ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
          <FileText className="w-8 h-8" />
        </div>
        <FileActions
          file={file}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          onDeprecate={onDeprecate}
          onOpenLocation={onOpenLocation}
        />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-sm line-clamp-2" title={file.filename}>
          {file.filename}
        </h3>
        {isDeprecated && <Badge variant="secondary" className="mt-1">Deprecated</Badge>}
      </div>

      <div className="text-xs text-muted-foreground mt-3 pt-3 border-t flex justify-between items-center">
        <span>{formattedSize}</span>
        <span>{new Date(file.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function FileActions({ file, onRename, onMove, onDelete, onDeprecate, onOpenLocation }: Omit<FileCardProps, "viewMode">) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/documents/${file.id}/download`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href={downloadUrl} target="_blank" rel="noreferrer" className="flex items-center cursor-pointer w-full">
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </DropdownMenuItem>
        {onOpenLocation && (
          <DropdownMenuItem onClick={() => onOpenLocation(file)}>
            <FolderInput className="h-4 w-4 mr-2" />
            Tampilkan Lokasi
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onRename(file)}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMove(file)}>
          <FolderInput className="h-4 w-4 mr-2" />
          Move to...
        </DropdownMenuItem>
        
        {!file.is_deprecated && (
          <DropdownMenuItem onClick={() => onDeprecate(file)} className="text-amber-600 focus:text-amber-600">
            <Ban className="h-4 w-4 mr-2" />
            Deprecate
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
