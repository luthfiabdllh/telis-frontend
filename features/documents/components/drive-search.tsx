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
import { ChevronDown, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetadataOptions } from "../api/document-api";

interface DriveSearchProps {
  currentFolderId?: string | null;
}

const CATEGORIES = [
  "ALL", "NDA", "PROCUREMENT_CONTRACT", "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT", "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY", "LEGAL_CORRESPONDENCE", "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT", "OTHER"
];

function FilterPill({ label, isActive, children }: { label: React.ReactNode; isActive: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-full transition-colors",
            isActive 
              ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100" 
              : "border-gray-300 text-gray-700 hover:bg-muted"
          )}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function DriveSearch({ currentFolderId }: DriveSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isGlobal, setIsGlobal] = React.useState(true);
  
  const [documentType, setDocumentType] = React.useState("ALL");
  const [riskLevel, setRiskLevel] = React.useState("ALL");
  const [vendorName, setVendorName] = React.useState("");
  const [businessUnit, setBusinessUnit] = React.useState("");
  const [sortBy, setSortBy] = React.useState("filename");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [options, setOptions] = React.useState<MetadataOptions>({ vendors: [], business_units: [] });

  React.useEffect(() => {
    documentApi.getMetadataOptions().then(setOptions).catch(console.error);
  }, []);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch, isGlobal, currentFolderId, documentType, riskLevel, vendorName, businessUnit, sortBy, sortOrder],
    queryFn: () => documentApi.searchDrive(debouncedSearch, currentFolderId, isGlobal, documentType, riskLevel, vendorName, businessUnit, sortBy, sortOrder),
    enabled: open,
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
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (documentType !== "ALL") params.append("document_type", documentType);
    if (riskLevel !== "ALL") params.append("risk_level", riskLevel);
    if (vendorName) params.append("vendor_name", vendorName);
    if (businessUnit) params.append("business_unit", businessUnit);
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder);

    if (isGlobal) {
      params.append("is_global", "true");
    } else if (currentFolderId) {
      params.append("folder_id", currentFolderId);
    }
    router.push(`/dashboard/documents?${params.toString()}`);
  };

  const hasFilters = documentType !== "ALL" || riskLevel !== "ALL" || vendorName !== "" || businessUnit !== "" || sortBy !== "filename" || sortOrder !== "asc";
  const clearFilters = () => {
    setDocumentType("ALL");
    setRiskLevel("ALL");
    setVendorName("");
    setBusinessUnit("");
    setSortBy("filename");
    setSortOrder("asc");
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "filename": return "Nama";
      case "created_at": return "Date Created";
      case "file_size_bytes": return "Size";
      case "risk_level": return "Risk Level";
      default: return "Sort";
    }
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
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-muted/10">
            {/* Jenis */}
            <FilterPill 
              isActive={documentType !== "ALL"} 
              label={<>{documentType === "ALL" ? "Jenis" : documentType} <ChevronDown className="w-3 h-3 opacity-70" /></>}
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => setDocumentType("ALL")}>Semua Jenis</CommandItem>
                    {CATEGORIES.filter(c => c !== "ALL").map(c => (
                      <CommandItem key={c} onSelect={() => setDocumentType(c)}>{c}</CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </FilterPill>

            {/* Orang / Vendor */}
            <FilterPill 
              isActive={vendorName !== ""} 
              label={<>{vendorName === "" ? "Orang" : vendorName} <ChevronDown className="w-3 h-3 opacity-70" /></>}
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => setVendorName("")}>Semua Orang</CommandItem>
                    {options.vendors?.map(v => (
                      <CommandItem key={v} onSelect={() => setVendorName(v)}>{v}</CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </FilterPill>

            {/* Business Unit */}
            <FilterPill 
              isActive={businessUnit !== ""} 
              label={<>{businessUnit === "" ? "Divisi" : businessUnit} <ChevronDown className="w-3 h-3 opacity-70" /></>}
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => setBusinessUnit("")}>Semua Divisi</CommandItem>
                    {options.business_units?.map(b => (
                      <CommandItem key={b} onSelect={() => setBusinessUnit(b)}>{b}</CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </FilterPill>

            {/* Risiko */}
            <FilterPill 
              isActive={riskLevel !== "ALL"} 
              label={<>{riskLevel === "ALL" ? "Risiko" : riskLevel} <ChevronDown className="w-3 h-3 opacity-70" /></>}
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => setRiskLevel("ALL")}>Semua Risiko</CommandItem>
                    <CommandItem onSelect={() => setRiskLevel("LOW")}>Low</CommandItem>
                    <CommandItem onSelect={() => setRiskLevel("MEDIUM")}>Medium</CommandItem>
                    <CommandItem onSelect={() => setRiskLevel("HIGH")}>High</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </FilterPill>

            {/* Sort */}
            <FilterPill 
              isActive={true} 
              label={
                <>
                  {getSortLabel()} 
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full text-blue-600 border border-blue-200 ml-1">
                    {sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </span>
                </>
              }
            >
              <Command>
                <CommandList>
                  <CommandGroup heading="Sort By">
                    <CommandItem onSelect={() => setSortBy("filename")}>Nama</CommandItem>
                    <CommandItem onSelect={() => setSortBy("created_at")}>Date Created</CommandItem>
                    <CommandItem onSelect={() => setSortBy("file_size_bytes")}>Size</CommandItem>
                    <CommandItem onSelect={() => setSortBy("risk_level")}>Risk Level</CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Order">
                    <CommandItem onSelect={() => setSortOrder("asc")}>Ascending</CommandItem>
                    <CommandItem onSelect={() => setSortOrder("desc")}>Descending</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </FilterPill>

            {hasFilters && (
              <button onClick={clearFilters} className="p-1 hover:bg-muted rounded-full ml-auto">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
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
