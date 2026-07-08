import { MoreVertical, Pencil, FolderInput, Trash2, Ban, Download, Eye } from "lucide-react";
import { DocumentType } from "../schemas/document-schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileGraphic, FormatFileProps } from "./file";

function getFileFormat(filename: string): FormatFileProps {
  const ext = filename.split('.').pop()?.toLowerCase();
  const validFormats: FormatFileProps[] = ["doc", "pdf", "md", "mdx", "csv", "xls", "xlsx", "txt", "ppt", "pptx", "zip", "rar", "tar", "gz", "code", "html", "js", "jsx", "tsx", "css", "json", "img", "png", "jpg", "jpeg", "video"];
  if (ext && validFormats.includes(ext as FormatFileProps)) {
    return ext as FormatFileProps;
  }
  if (ext === "mp4" || ext === "avi" || ext === "mkv") return "video";
  if (ext === "svg" || ext === "webp" || ext === "gif") return "img";
  if (ext === "docx") return "doc";
  return "txt";
}

interface FileCardProps {
  file: DocumentType;
  onRename: (file: DocumentType) => void;
  onMove: (file: DocumentType) => void;
  onDelete: (file: DocumentType) => void;
  onDeprecate: (file: DocumentType) => void;
  onRestore: (file: DocumentType) => void;
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

export function FileCard({ file, onRename, onMove, onDelete, onDeprecate, onRestore, onOpenLocation, viewMode }: FileCardProps) {
  const isDeprecated = file.is_deprecated;
  const formattedSize = formatBytes(file.file_size_bytes);
  const router = useRouter();
  const fileFormat = getFileFormat(file.filename);

  const handleCardClick = async () => {
    router.push(`/dashboard/documents/${file.id}`);
  };

  if (viewMode === "list") {
    return (
      <div 
        onClick={handleCardClick}
        className={`flex items-center justify-between p-3 border-b hover:bg-muted/50 transition-colors group cursor-pointer ${isDeprecated ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center space-x-3 flex-1 overflow-hidden">
          <div className={`p-1 flex items-center justify-center rounded-lg ${isDeprecated ? 'opacity-60 grayscale' : ''}`}>
            <div className="transform scale-[0.4] origin-left pointer-events-none w-10">
              <FileGraphic formatFile={fileFormat} />
            </div>
          </div>
          <div className="flex flex-col truncate flex-1">
            <span className="font-medium truncate flex items-center gap-2">
              {file.filename}
              {isDeprecated && <Badge variant="secondary" className="text-[10px] h-4">Deprecated</Badge>}
              {file.status === 'PENDING_APPROVAL' && <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] h-4">Menunggu Persetujuan</Badge>}
              {file.status === 'APPROVED' && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-4">Disetujui</Badge>}
              {file.status === 'REJECTED' && <Badge className="bg-red-500 hover:bg-red-600 text-[10px] h-4">Ditolak</Badge>}
              {file.status === 'FAILED' && <Badge variant="destructive" className="text-[10px] h-4">Gagal Diproses</Badge>}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedSize} • {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <FileActions
            file={file}
            onRename={onRename}
            onMove={onMove}
            onDelete={onDelete}
            onDeprecate={onDeprecate}
            onRestore={onRestore}
            onOpenLocation={onOpenLocation}
          />
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      onClick={handleCardClick}
      className={`relative aspect-square border border-border/50 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 group bg-card/60 backdrop-blur-xl cursor-pointer overflow-hidden flex flex-col ${isDeprecated ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="absolute top-2 right-2 z-50" onClick={(e) => e.stopPropagation()}>
        <FileActions
          file={file}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          onDeprecate={onDeprecate}
          onRestore={onRestore}
          onOpenLocation={onOpenLocation}
        />
      </div>
      
      <div className="w-full flex-1 relative flex items-center justify-center pointer-events-none mt-2">
        <div className="flex items-center justify-center w-0 h-0">
          <div className="transform scale-[1.3] sm:scale-[1.5] lg:scale-[1.6] group-hover:scale-[1.4] sm:group-hover:scale-[1.6] lg:group-hover:scale-[1.7] transition-transform duration-300">
            <FileGraphic formatFile={fileFormat} />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 w-full text-center relative z-10 bg-linear-to-t from-card/80 to-transparent mt-auto flex flex-col items-center">
        <h3 className="font-semibold text-xs sm:text-sm truncate w-full group-hover:text-primary transition-colors" title={file.filename}>
          {file.filename}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
          {isDeprecated && <Badge variant="secondary" className="text-[8px] sm:text-[10px] h-4 py-0 px-1">Deprecated</Badge>}
          {file.status === 'PENDING_APPROVAL' && <Badge className="bg-amber-500 hover:bg-amber-600 text-[8px] sm:text-[10px] h-4 py-0 px-1">Menunggu Persetujuan</Badge>}
          {file.status === 'APPROVED' && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[8px] sm:text-[10px] h-4 py-0 px-1">Disetujui</Badge>}
          {file.status === 'REJECTED' && <Badge className="bg-red-500 hover:bg-red-600 text-[8px] sm:text-[10px] h-4 py-0 px-1">Ditolak</Badge>}
          {file.status === 'FAILED' && <Badge variant="destructive" className="text-[8px] sm:text-[10px] h-4 py-0 px-1">Gagal Diproses</Badge>}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 w-full flex justify-between items-center gap-1">
          <span>{formattedSize}</span>
          <span>{new Date(file.created_at).toLocaleDateString()}</span>
        </p>
      </div>
    </div>
  );
}

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

function FileActions({ file, onRename, onMove, onDelete, onDeprecate, onRestore, onOpenLocation }: Omit<FileCardProps, "viewMode">) {
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
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/documents/${file.id}`} className="flex items-center cursor-pointer w-full">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
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
        
        {file.is_deprecated ? (
          <DropdownMenuItem onClick={() => onRestore(file)} className="text-teal-600 focus:text-teal-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restore (Un-deprecate)
          </DropdownMenuItem>
        ) : (
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
