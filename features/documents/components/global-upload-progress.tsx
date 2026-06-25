"use client";

import { useUploadStore } from '../store/upload-store';
import { ChevronDown, ChevronUp, X, CheckCircle2, FileText, Loader2, AlertCircle, Trash2, Ban, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function GlobalUploadProgress() {
  const { uploads, isMinimized, toggleMinimized, clearCompleted } = useUploadStore();

  if (uploads.length === 0) return null;

  const uploadingCount = uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length;
  const isAllDone = uploadingCount === 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-background border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/80 cursor-pointer hover:bg-muted"
        onClick={toggleMinimized}
      >
        <span className="font-semibold text-sm">
          {isAllDone ? "Upload selesai" : `Mengupload ${uploadingCount} item...`}
        </span>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-muted-foreground/20 rounded-full transition-colors">
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isAllDone && (
            <button 
              className="p-1 hover:bg-muted-foreground/20 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                clearCompleted();
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {uploads.map((upload) => {
            const getIcon = () => {
              if (upload.type === 'delete') return <Trash2 className="w-6 h-6 text-destructive mr-3 shrink-0" />;
              if (upload.type === 'deprecate') return <Ban className="w-6 h-6 text-amber-600 mr-3 shrink-0" />;
              if (upload.type === 'restore') return <RefreshCw className="w-6 h-6 text-teal-600 mr-3 shrink-0" />;
              return <FileText className="w-6 h-6 text-red-500 mr-3 shrink-0" />;
            };

            const getActionText = () => {
              if (upload.type === 'delete') return 'Menghapus di latar belakang...';
              if (upload.type === 'deprecate') return 'Mengusangkan dokumen...';
              if (upload.type === 'restore') return 'AI memproses ulang dokumen...';
              return 'Memproses di latar belakang...';
            };

            return (
            <div key={upload.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
              {getIcon()}
              
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-medium truncate" title={upload.filename}>
                  {upload.filename}
                </p>
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="h-1 mt-1.5" />
                )}
                {upload.status === 'processing' && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{getActionText()}</p>
                )}
                {upload.status === 'error' && (
                  <p className="text-[10px] text-destructive mt-0.5 truncate" title={upload.errorMessage}>
                    {upload.errorMessage}
                  </p>
                )}
              </div>
              
              <div className="shrink-0 w-6 flex justify-end">
                {upload.status === 'uploading' && (
                  <span className="text-[10px] font-medium text-muted-foreground">{upload.progress}%</span>
                )}
                {upload.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {upload.status === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
