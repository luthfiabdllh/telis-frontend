"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDrive } from "../hooks/use-drive";
import { DriveActionBar } from "./drive-action-bar";
import { FolderCard } from "./folder-card";
import { FileCard } from "./file-card";
import { CreateFolderModal } from "./modals/create-folder-modal";
import { UploadDocumentModal } from "./modals/upload-document-modal";
import { RenameModal } from "./modals/rename-modal";
import { MoveItemModal } from "./modals/move-item-modal";
import { Folder, DocumentType } from "../api/document-api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Folder as FolderIcon } from "lucide-react";
import { useUploadStore, triggerUpload } from "../store/upload-store";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

type ModalState = {
  createFolder: boolean;
  uploadDocument: boolean;
  rename: { isOpen: boolean; type: "folder" | "file"; item: Folder | DocumentType | null };
  move: { isOpen: boolean; type: "folder" | "file"; item: Folder | DocumentType | null };
};

export function DriveContainer() {
  const searchParams = useSearchParams();
  const folderIdParam = searchParams.get("folder_id");
  const currentFolderId = folderIdParam === "null" ? null : folderIdParam;
  
  const searchQuery = searchParams.get("search") || undefined;
  const isGlobal = searchParams.get("is_global") === "true";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modals, setModals] = useState<ModalState>({
    createFolder: false,
    uploadDocument: false,
    rename: { isOpen: false, type: "folder", item: null },
    move: { isOpen: false, type: "folder", item: null },
  });

  const queryClient = useQueryClient();
  const addUpload = useUploadStore((state) => state.addUpload);

  const {
    folders,
    documents,
    path,
    isLoading,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    uploadDocument,
    renameDocument,
    moveDocument,
    deleteDocument,
    deprecateDocument,
  } = useDrive(currentFolderId, searchQuery, isGlobal);

  const handleRenameSubmit = async (newName: string) => {
    const { type, item } = modals.rename;
    if (!item) return;

    try {
      if (type === "folder") {
        await renameFolder.mutateAsync({ id: item.id, name: newName });
      } else {
        await renameDocument.mutateAsync({ id: item.id, name: newName });
      }
      toast.success("Renamed successfully");
      closeModal("rename");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to rename", { description: msg });
    }
  };

  const handleMoveSubmit = async (destinationFolderId: string | null) => {
    const { type, item } = modals.move;
    if (!item) return;

    try {
      if (type === "folder") {
        await moveFolder.mutateAsync({ id: item.id, parentId: destinationFolderId });
      } else {
        await moveDocument.mutateAsync({ id: item.id, folderId: destinationFolderId });
      }
      toast.success("Moved successfully");
      closeModal("move");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to move", { description: msg });
    }
  };

  const openRename = (type: "folder" | "file", item: Folder | DocumentType) => {
    setModals((prev) => ({ ...prev, rename: { isOpen: true, type, item } }));
  };

  const openMove = (type: "folder" | "file", item: Folder | DocumentType) => {
    setModals((prev) => ({ ...prev, move: { isOpen: true, type, item } }));
  };

  const handleDelete = async (type: "folder" | "file", item: Folder | DocumentType) => {
    if (!confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
    try {
      if (type === "folder") {
        await deleteFolder.mutateAsync(item.id);
      } else {
        await deleteDocument.mutateAsync(item.id);
      }
      toast.success("Deleted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to delete", { description: msg });
    }
  };

  const handleDeprecate = async (file: DocumentType) => {
    if (!confirm("Are you sure you want to deprecate this document? It will no longer be used for AI reasoning.")) return;
    try {
      await deprecateDocument.mutateAsync(file.id);
      toast.success("Document deprecated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to deprecate", { description: msg });
    }
  };

  const closeModal = (key: keyof ModalState) => {
    if (key === "rename" || key === "move") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setModals((prev) => ({ ...prev, [key]: { ...(prev[key as keyof ModalState] as any), isOpen: false } }));
    } else {
      setModals((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <DriveActionBar
        path={path}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateFolderClick={() => setModals((p) => ({ ...p, createFolder: true }))}
        onUploadClick={() => setModals((p) => ({ ...p, uploadDocument: true }))}
      />

      {isLoading ? (
        <div className="flex-1 overflow-auto mt-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {folders.length === 0 && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 pt-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center opacity-50">
                <FolderIcon className="w-12 h-12" />
              </div>
              <p>This folder is empty.</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "space-y-8" : "space-y-0"}>
              {folders.length > 0 && (
                <div>
                  {viewMode === "grid" && <h2 className="text-sm font-semibold text-muted-foreground mb-4">Folders</h2>}
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col"}>
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        viewMode={viewMode}
                        onRename={(f) => openRename("folder", f)}
                        onMove={(f) => openMove("folder", f)}
                        onDelete={(f) => handleDelete("folder", f)}
                        onOpenLocation={searchQuery ? (f) => {
                          const url = f.parent_id ? `/dashboard/documents?folder_id=${f.parent_id}` : `/dashboard/documents`;
                          window.location.href = url; // Force reload to clear search if using link, or push to router
                        } : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {documents.length > 0 && (
                <div className={viewMode === "list" && folders.length > 0 ? "mt-6" : ""}>
                  {viewMode === "grid" && <h2 className="text-sm font-semibold text-muted-foreground mb-4">Files</h2>}
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col border-t mt-4"}>
                    {documents.map((doc) => (
                      <FileCard
                        key={doc.id}
                        file={doc}
                        viewMode={viewMode}
                        onRename={(f) => openRename("file", f)}
                        onMove={(f) => openMove("file", f)}
                        onDelete={(f) => handleDelete("file", f)}
                        onDeprecate={(f) => handleDeprecate(f)}
                        onOpenLocation={searchQuery ? (f) => {
                          const url = f.folder_id ? `/dashboard/documents?folder_id=${f.folder_id}` : `/dashboard/documents`;
                          window.location.href = url;
                        } : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CreateFolderModal
        isOpen={modals.createFolder}
        isLoading={createFolder.isPending}
        onClose={() => closeModal("createFolder")}
        onSubmit={async (name) => {
          await createFolder.mutateAsync(name);
          closeModal("createFolder");
        }}
      />

      <UploadDocumentModal
        isOpen={modals.uploadDocument}
        onClose={() => closeModal("uploadDocument")}
        onSubmit={(file) => {
          const uploadId = nanoid();
          addUpload({
            id: uploadId,
            file,
            filename: file.name,
            folderId: currentFolderId,
            progress: 0,
            status: "uploading",
          });
          closeModal("uploadDocument");
          triggerUpload(uploadId, file, currentFolderId, queryClient);
        }}
      />

      {modals.rename.item && (
        <RenameModal
          isOpen={modals.rename.isOpen}
          isLoading={renameFolder.isPending || renameDocument.isPending}
          onClose={() => closeModal("rename")}
          onSubmit={handleRenameSubmit}
          type={modals.rename.type}
          initialName={modals.rename.type === "folder" ? (modals.rename.item as Folder).name : (modals.rename.item as DocumentType).filename}
        />
      )}

      {modals.move.item && (
        <MoveItemModal
          isOpen={modals.move.isOpen}
          isLoading={moveFolder.isPending || moveDocument.isPending}
          onClose={() => closeModal("move")}
          onSubmit={handleMoveSubmit}
          itemName={modals.move.type === "folder" ? (modals.move.item as Folder).name : (modals.move.item as DocumentType).filename}
        />
      )}
    </div>
  );
}
