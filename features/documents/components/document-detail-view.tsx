"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  LayoutGrid,
  ShieldAlert,
  Building,
  Building2,
  CalendarDays,
  DollarSign,
  ListChecks,
  FileText,
  CheckSquare,
  BrainCircuit,
  Info,
} from "lucide-react";
import Link from "next/link";
import { formatBytes } from "./file-card";
import { ApprovalsTab } from "./approvals-tab";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  documentMetadataSchema,
  DocumentMetadataInput,
} from "../schemas/document-schemas";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { Sparkles, SparklesIcon } from "@/components/animate-ui/icons/sparkles";

const PdfViewerCustom = dynamic(() => import("./pdf-viewer-custom"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
      <Spinner className="w-8 h-8" />
      <span className="text-sm font-medium">Memuat PDF Viewer...</span>
    </div>
  ),
});

interface DocumentDetailViewProps {
  id: string;
}

const CATEGORIES = [
  "NDA",
  "PROCUREMENT_CONTRACT",
  "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT",
  "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY",
  "LEGAL_CORRESPONDENCE",
  "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT",
  "OTHER",
];

const RISK_LEVELS = ["UNKNOWN", "LOW", "MEDIUM", "HIGH"];

export function DocumentDetailView({ id }: DocumentDetailViewProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", id],
    queryFn: () => documentApi.getDocumentByID(id),
  });

  const { data: pdfBlob, isLoading: isPdfLoading } = useQuery({
    queryKey: ["document-pdf", id],
    queryFn: () => documentApi.downloadFileBlob(id),
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  const { control, handleSubmit, reset } = useForm<DocumentMetadataInput>({
    resolver: zodResolver(documentMetadataSchema),
    defaultValues: {
      document_type: "",
      risk_level: "",
      vendor_name: "",
      business_unit: "",
      effective_date: "",
      expiry_date: "",
    },
  });

  useEffect(() => {
    if (document) {
      reset({
        document_type: document.document_type || "OTHER",
        risk_level: document.risk_level || "UNKNOWN",
        vendor_name: document.vendor_name || "",
        business_unit: document.business_unit || "",
        effective_date: document.effective_date
          ? document.effective_date.split("T")[0]
          : "",
        expiry_date: document.expiry_date
          ? document.expiry_date.split("T")[0]
          : "",
      });
    }
  }, [document, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DocumentMetadataInput>) =>
      documentApi.updateMetadata(id, {
        ...data,
        effective_date: data.effective_date
          ? new Date(data.effective_date).toISOString()
          : undefined,
        expiry_date: data.expiry_date
          ? new Date(data.expiry_date).toISOString()
          : undefined,
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Metadata updated successfully");
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error("Failed to update metadata", { description: err.message });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: (force?: boolean) => documentApi.summarizeDocument(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      toast.success("AI Summary generated successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to generate summary", { description: err.message });
    },
  });

  const onSubmit = (data: DocumentMetadataInput) => {
    updateMutation.mutate(data);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Spinner />
      </div>
    );
  if (error || !document)
    return (
      <div className="p-6 text-destructive flex h-[calc(100vh-4rem)] items-center justify-center">
        Failed to load document
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Modern Header */}
      <div className="flex items-start md:items-center gap-3 md:gap-4 px-4 md:px-6 py-4 border-b">
        <Link
          href={`/dashboard/documents${document.folder_id ? `?folder_id=${document.folder_id}` : ""}`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate">
              {document.filename}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {document.document_type && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent"
                >
                  {document.document_type}
                </Badge>
              )}
              {document.status === "PENDING_APPROVAL" && (
                <Badge className="bg-chart-5/10 text-chart-5 border-chart-5/20 hover:bg-chart-5/20 shadow-none">
                  Menunggu Persetujuan
                </Badge>
              )}
              {document.status === "APPROVED" && (
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20 shadow-none">
                  Disetujui
                </Badge>
              )}
              {document.status === "REJECTED" && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 shadow-none">
                  Ditolak
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 md:mt-1 flex items-center gap-2 flex-wrap">
            <span>{formatBytes(document.file_size_bytes)}</span>
            <span className="hidden md:inline">•</span>
            <span>
              Diunggah oleh{" "}
              <span className="font-medium text-foreground">
                {document.uploaded_by}
              </span>
            </span>
            <span className="hidden md:inline">•</span>
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResizablePanelGroup
          key={isTablet ? "vertical" : "horizontal"}
          orientation={isTablet ? "vertical" : "horizontal"}
        >
          {/* Left Panel: PDF Viewer */}
          <ResizablePanel
            defaultSize={isTablet ? 70 : 65}
            minSize={20}
            className="relative bg-neutral-950"
          >
            {isPdfLoading || !pdfUrl ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
                <Spinner className="w-8 h-8" />
                <span className="text-sm font-medium">
                  Memuat dokumen PDF...
                </span>
              </div>
            ) : (
              <PdfViewerCustom fileUrl={pdfUrl} />
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Context Sidebar */}
          <ResizablePanel
            defaultSize={isTablet ? 30 : 35}
            minSize={20}
            className="bg-muted/30"
          >
            <Tabs defaultValue="ai" className="flex flex-col h-full">
              <div className="px-4 py-3 border-b bg-background">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                  <TabsTrigger
                    value="ai"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    <Sparkles animateOnView={true} className="w-3.5 h-3.5 mr-1.5" /> AI
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    <Info className="w-3.5 h-3.5 mr-1.5" /> Data
                  </TabsTrigger>
                  <TabsTrigger
                    value="approvals"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Proses
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* AI Tab */}
              <TabsContent
                value="ai"
                className="flex-1 overflow-y-auto p-0 m-0 data-[state=active]:flex flex-col"
              >
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <BrainCircuit className="w-5 h-5" /> Analisis AI
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ekstraksi cerdas dokumen oleh LLM
                      </p>
                    </div>
                    {document.summary && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-primary/20 hover:bg-primary/10 hover:text-primary"
                        onClick={() => summarizeMutation.mutate(true)}
                        disabled={summarizeMutation.isPending}
                      >
                        {summarizeMutation.isPending ? (
                          <Spinner className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Segarkan
                      </Button>
                    )}
                  </div>

                  {document.summary ? (
                    <div className="space-y-6 pb-6">
                      {(() => {
                        try {
                          const sumObj = JSON.parse(document.summary);
                          return (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
                              {/* Summary Box */}
                              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 p-5 shadow-sm backdrop-blur-md">
                                <div className="relative z-10">
                                  <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                    Ringkasan Eksekutif
                                    <SparklesIcon className="w-4 h-4 text-primary" />
                                  </h4>
                                  <p className="text-sm leading-relaxed text-foreground/90">
                                    {sumObj.ringkasan_singkat}
                                  </p>
                                </div>
                              </div>

                              {/* Grid Data */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-md bg-chart-1/10 text-chart-1">
                                      <Building className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-semibold">
                                      Pihak Terlibat
                                    </h4>
                                  </div>
                                  <ul className="space-y-1.5">
                                    {sumObj.pihak_terlibat?.map(
                                      (p: string, i: number) => (
                                        <li
                                          key={i}
                                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                                        >
                                          <span className="w-1 h-1 rounded-full bg-chart-1/50 mt-1.5 shrink-0" />
                                          <span className="leading-snug">
                                            {p}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>

                                <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-md bg-chart-5/10 text-chart-5">
                                      <ListChecks className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-semibold">
                                      Kewajiban Utama
                                    </h4>
                                  </div>
                                  <ul className="space-y-1.5">
                                    {sumObj.kewajiban_utama?.map(
                                      (k: string, i: number) => (
                                        <li
                                          key={i}
                                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                                        >
                                          <span className="w-1 h-1 rounded-full bg-chart-5/50 mt-1.5 shrink-0" />
                                          <span className="leading-snug">
                                            {k}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {/* Clauses */}
                              <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-md bg-chart-3/10 text-chart-3">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <h4 className="text-xs font-semibold">
                                    Klausul Penting
                                  </h4>
                                </div>
                                <ul className="space-y-2">
                                  {sumObj.klausul_penting?.map(
                                    (k: string, i: number) => (
                                      <li
                                        key={i}
                                        className="text-xs text-muted-foreground flex items-start gap-2 bg-muted/30 p-2 rounded-md"
                                      >
                                        <span className="text-chart-3 font-bold">
                                          •
                                        </span>
                                        <span className="leading-relaxed">
                                          {k}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              {/* Dates & Values */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-xl border bg-card p-3 shadow-sm flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-chart-2/10 text-chart-2">
                                    <CalendarDays className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                      Masa Berlaku
                                    </p>
                                    <p className="text-xs font-medium mt-0.5">
                                      {sumObj.masa_berlaku}
                                    </p>
                                  </div>
                                </div>
                                <div className="rounded-xl border bg-card p-3 shadow-sm flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-chart-4/10 text-chart-4">
                                    <DollarSign className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                      Nilai Kontrak
                                    </p>
                                    <p className="text-xs font-medium mt-0.5">
                                      {sumObj.nilai_kontrak}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="p-4 bg-muted/50 rounded-xl whitespace-pre-wrap text-sm border">
                              {document.summary}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60%] space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">
                          Belum Ada Analisis AI
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">
                          Biarkan AI membaca dan mengekstrak informasi penting
                          dari dokumen ini untuk Anda.
                        </p>
                      </div>
                      <Button
                        onClick={() => summarizeMutation.mutate(false)}
                        disabled={summarizeMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                      >
                        {summarizeMutation.isPending ? (
                          <Spinner className="mr-2" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Mulai Analisis
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Metadata Tab */}
              <TabsContent
                value="metadata"
                className="flex-1 overflow-y-auto p-4 md:p-6 m-0"
              >
                <form
                  id="metadata-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Informasi Detail</h3>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            reset();
                            setIsEditing(false);
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Spinner className="w-3.5 h-3.5 mr-2" />
                          ) : (
                            <Save className="w-3.5 h-3.5 mr-2" />
                          )}
                          Simpan
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {/* Operational Risk Card */}
                  <div
                    className={cn(
                      "p-4 rounded-xl border",
                      document.risk_level === "HIGH"
                        ? "bg-destructive/10 border-destructive/20"
                        : document.risk_level === "MEDIUM"
                          ? "bg-chart-5/10 border-chart-5/20"
                          : "bg-chart-2/10 border-chart-2/20",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert
                        className={cn(
                          "w-4 h-4",
                          document.risk_level === "HIGH"
                            ? "text-destructive"
                            : document.risk_level === "MEDIUM"
                              ? "text-chart-5"
                              : "text-chart-2",
                        )}
                      />
                      <h4 className="font-semibold text-sm">
                        Tingkat Risiko Operasional
                      </h4>
                    </div>

                    {isEditing ? (
                      <Controller
                        control={control}
                        name="risk_level"
                        render={({ field, fieldState }) => (
                          <Field>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Pilih Risiko" />
                              </SelectTrigger>
                              <SelectContent>
                                {RISK_LEVELS.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                    ) : (
                      <div>
                        <Badge
                          className={cn(
                            "shadow-none",
                            document.risk_level === "HIGH"
                              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              : document.risk_level === "MEDIUM"
                                ? "bg-chart-5 hover:bg-chart-5/90 text-primary-foreground"
                                : document.risk_level === "UNKNOWN"
                                  ? "bg-muted text-foreground"
                                  : "bg-chart-2 hover:bg-chart-2/90 text-primary-foreground",
                          )}
                        >
                          {document.risk_level || "UNKNOWN"}
                        </Badge>
                        {document.risk_reasoning && (
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground bg-background/50 p-3 rounded-lg border">
                            <span className="font-semibold block mb-1">
                              Catatan Sistem:
                            </span>
                            {document.risk_reasoning}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    {/* Category */}
                    <div className="space-y-2">
                      <FieldLabel className="text-muted-foreground">
                        <LayoutGrid className="w-3.5 h-3.5" /> Kategori Dokumen
                      </FieldLabel>
                      {isEditing ? (
                        <Controller
                          control={control}
                          name="document_type"
                          render={({ field, fieldState }) => (
                            <Field>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError errors={[fieldState.error]} />
                            </Field>
                          )}
                        />
                      ) : (
                        <div className="font-medium text-sm">
                          {document.document_type || "-"}
                        </div>
                      )}
                    </div>

                    {/* Entities Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldLabel className="text-muted-foreground">
                          <Building className="w-3.5 h-3.5" /> Nama Vendor
                        </FieldLabel>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="vendor_name"
                            render={({ field, fieldState }) => (
                              <Field>
                                <Input className="bg-background" {...field} />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        ) : (
                          <div
                            className="font-medium text-sm truncate"
                            title={document.vendor_name}
                          >
                            {document.vendor_name || "-"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <FieldLabel className="text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" /> Unit Bisnis
                        </FieldLabel>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="business_unit"
                            render={({ field, fieldState }) => (
                              <Field>
                                <Input className="bg-background" {...field} />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        ) : (
                          <div
                            className="font-medium text-sm truncate"
                            title={document.business_unit}
                          >
                            {document.business_unit || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldLabel className="text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" /> Tanggal
                          Efektif
                        </FieldLabel>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="effective_date"
                            render={({ field, fieldState }) => (
                              <Field>
                                <Input
                                  className="bg-background"
                                  type="date"
                                  {...field}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        ) : (
                          <div className="font-medium text-sm">
                            {document.effective_date
                              ? new Date(
                                  document.effective_date,
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <FieldLabel className="text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" /> Tanggal
                          Kadaluarsa
                        </FieldLabel>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="expiry_date"
                            render={({ field, fieldState }) => (
                              <Field>
                                <Input
                                  className="bg-background"
                                  type="date"
                                  {...field}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        ) : (
                          <div className="font-medium text-sm">
                            {document.expiry_date
                              ? new Date(
                                  document.expiry_date,
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* Approvals Tab */}
              <TabsContent
                value="approvals"
                className="flex-1 overflow-y-auto p-4 md:p-6 m-0"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" /> Alur Persetujuan
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pantau dan kelola proses persetujuan dokumen ini
                  </p>
                </div>
                <ApprovalsTab documentId={id} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
