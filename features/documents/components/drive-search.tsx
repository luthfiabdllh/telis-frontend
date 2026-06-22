"use client";

import * as React from "react";
import { Search, Folder, File as FileIcon, Loader2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { documentApi } from "../api/document-api";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DriveSearchProps {
  currentFolderId?: string | null;
}

export function DriveSearch({ currentFolderId }: DriveSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isGlobal, setIsGlobal] = React.useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch, isGlobal, currentFolderId],
    queryFn: () => documentApi.searchDrive(debouncedSearch, currentFolderId, isGlobal),
    enabled: debouncedSearch.length > 0,
  });

  const handleSelectFolder = (id: string) => {
    setOpen(false);
    router.push(`/dashboard/documents?folder_id=${id}`);
  };

  const handleSelectDocument = (id: string) => {
    setOpen(false);
    // Ideally open preview, but for now we navigate to the folder containing it, or just show toast?
    // Let's just find its folder and navigate there if possible?
    // But we don't have the explicit folder_id in the click handler if we only have ID, wait we do have the document object!
    const doc = data?.documents.find(d => d.id === id);
    if (doc) {
       router.push(doc.folder_id ? `/dashboard/documents?folder_id=${doc.folder_id}` : `/dashboard/documents`);
    }
  };

  const maxResults = 5;
  const folders = data?.folders || [];
  const documents = data?.documents || [];
  
  const displayFolders = folders.slice(0, maxResults);
  const displayDocuments = documents.slice(0, maxResults - displayFolders.length);
  
  const hasResults = displayFolders.length > 0 || displayDocuments.length > 0;

  const handleShowAll = () => {
    setOpen(false);
    const params = new URLSearchParams();
    params.append("search", debouncedSearch);
    if (isGlobal) {
      params.append("is_global", "true");
    } else if (currentFolderId) {
      params.append("folder_id", currentFolderId);
    }
    router.push(`/dashboard/documents?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-2xl flex-1 px-4">
      <Popover open={open && searchQuery.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search in Drive..."
              className="pl-9 pr-4 h-11 w-full bg-muted/50 border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary shadow-none text-base"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0 rounded-xl overflow-hidden shadow-lg border"
          align="start"
        >
          <Command shouldFilter={false} className="border-none">
            <div className="flex items-center px-3 py-2 border-b bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground mr-2">Location:</span>
              <div className="flex space-x-1">
                <Button
                  variant={isGlobal ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs rounded-full"
                  onClick={() => setIsGlobal(true)}
                >
                  All Drive
                </Button>
                <Button
                  variant={!isGlobal ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs rounded-full"
                  onClick={() => setIsGlobal(false)}
                >
                  This Folder
                </Button>
              </div>
            </div>

            <CommandList className="max-h-[400px] overflow-y-auto p-1">
              {isLoading && (
                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}

              {!isLoading && !hasResults && debouncedSearch.length > 0 && (
                <CommandEmpty className="p-6 text-center text-sm">
                  No matching files or folders found.
                </CommandEmpty>
              )}

              {!isLoading && displayFolders.length > 0 && (
                <CommandGroup heading="Folders">
                  {displayFolders.map((folder) => (
                    <CommandItem
                      key={folder.id}
                      value={folder.id}
                      onSelect={handleSelectFolder}
                      className="flex items-start py-2 cursor-pointer"
                    >
                      <Folder className="mr-3 h-5 w-5 mt-0.5 text-muted-foreground" fill="currentColor" fillOpacity={0.2} />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium text-sm truncate">{folder.name}</span>
                        {isGlobal && folder.folder_path && (
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{folder.folder_path}</span>
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!isLoading && displayDocuments.length > 0 && (
                <CommandGroup heading="Files">
                  {displayDocuments.map((doc) => (
                    <CommandItem
                      key={doc.id}
                      value={doc.id}
                      onSelect={handleSelectDocument}
                      className="flex items-start py-2 cursor-pointer"
                    >
                      <FileIcon className="mr-3 h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium text-sm truncate">{doc.filename}</span>
                        {isGlobal && doc.folder_path && (
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{doc.folder_path}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            
            {!isLoading && hasResults && (
              <div className="p-2 border-t bg-muted/20">
                <Button 
                  variant="ghost" 
                  className="w-full text-sm font-medium text-primary justify-center h-9"
                  onClick={handleShowAll}
                >
                  Lihat semua hasil untuk "{debouncedSearch}"
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
