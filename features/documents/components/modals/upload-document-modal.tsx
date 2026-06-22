import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  isLoading: boolean;
}

export function UploadDocumentModal({ isOpen, onClose, onSubmit, isLoading }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFile(null);
        onClose();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div
            className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PDF only (max 50MB)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm truncate">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={!file || isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
