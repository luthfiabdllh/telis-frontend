"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentApi, MetadataOptions } from "../api/document-api";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface DriveFilterRowProps {
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
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
}

const CATEGORIES = [
  "ALL", "NDA", "PROCUREMENT_CONTRACT", "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT", "REGULATORY_DOCUMENT", "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY", "LEGAL_CORRESPONDENCE", "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT", "OTHER"
];

function FilterPill({ label, isActive, children }: { label: React.ReactNode; isActive: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-full transition-colors",
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

export function DriveFilterRow({
  documentType,
  onDocumentTypeChange,
  riskLevel,
  onRiskLevelChange,
  vendorName,
  onVendorNameChange,
  businessUnit,
  onBusinessUnitChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: DriveFilterRowProps) {
  const [options, setOptions] = useState<MetadataOptions>({ vendors: [], business_units: [] });

  useEffect(() => {
    documentApi.getMetadataOptions().then((res) => {
      setOptions(res);
    }).catch(console.error);
  }, []);

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
    <div className="flex flex-wrap items-center gap-2 mb-4">
      
      {/* Kategori / Jenis */}
      <FilterPill 
        isActive={documentType !== "ALL"} 
        label={<>{documentType === "ALL" ? "Jenis" : documentType} <ChevronDown className="w-4 h-4 opacity-70" /></>}
      >
        <Command>
          <CommandInput placeholder="Cari jenis..." />
          <CommandList>
            <CommandEmpty>Tidak ada hasil.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => onDocumentTypeChange("ALL")}>Semua Jenis</CommandItem>
              {CATEGORIES.filter(c => c !== "ALL").map(c => (
                <CommandItem key={c} onSelect={() => onDocumentTypeChange(c)}>{c}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </FilterPill>

      {/* Orang / Vendor Name */}
      <FilterPill 
        isActive={vendorName !== ""} 
        label={<>{vendorName === "" ? "Vendor" : vendorName} <ChevronDown className="w-4 h-4 opacity-70" /></>}
      >
        <Command>
          <CommandInput placeholder="Cari vendor..." />
          <CommandList>
            <CommandEmpty>Tidak ada vendor.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => onVendorNameChange("")}>Semua Vendor</CommandItem>
              {options.vendors?.map(v => (
                <CommandItem key={v} onSelect={() => onVendorNameChange(v)}>{v}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </FilterPill>

      {/* Business Unit */}
      <FilterPill 
        isActive={businessUnit !== ""} 
        label={<>{businessUnit === "" ? "Divisi" : businessUnit} <ChevronDown className="w-4 h-4 opacity-70" /></>}
      >
        <Command>
          <CommandInput placeholder="Cari divisi..." />
          <CommandList>
            <CommandEmpty>Tidak ada divisi.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => onBusinessUnitChange("")}>Semua Divisi</CommandItem>
              {options.business_units?.map(b => (
                <CommandItem key={b} onSelect={() => onBusinessUnitChange(b)}>{b}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </FilterPill>

      {/* Risk Level */}
      <FilterPill 
        isActive={riskLevel !== "ALL"} 
        label={<>{riskLevel === "ALL" ? "Risiko" : riskLevel} <ChevronDown className="w-4 h-4 opacity-70" /></>}
      >
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem onSelect={() => onRiskLevelChange("ALL")}>Semua Risiko</CommandItem>
              <CommandItem onSelect={() => onRiskLevelChange("LOW")}>Low</CommandItem>
              <CommandItem onSelect={() => onRiskLevelChange("MEDIUM")}>Medium</CommandItem>
              <CommandItem onSelect={() => onRiskLevelChange("HIGH")}>High</CommandItem>
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
            <span className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full text-blue-600 border border-blue-200">
              {sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </span>
          </>
        }
      >
        <Command>
          <CommandList>
            <CommandGroup heading="Sort By">
              <CommandItem onSelect={() => onSortByChange("filename")}>Nama</CommandItem>
              <CommandItem onSelect={() => onSortByChange("created_at")}>Date Created</CommandItem>
              <CommandItem onSelect={() => onSortByChange("file_size_bytes")}>Size</CommandItem>
              <CommandItem onSelect={() => onSortByChange("risk_level")}>Risk Level</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Order">
              <CommandItem onSelect={() => onSortOrderChange("asc")}>Ascending</CommandItem>
              <CommandItem onSelect={() => onSortOrderChange("desc")}>Descending</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </FilterPill>

    </div>
  );
}
