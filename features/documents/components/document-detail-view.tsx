"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi, DocumentType } from "../api/document-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Sparkles, RefreshCw, LayoutGrid, ShieldAlert, Building, Building2, CalendarDays, DollarSign, ListChecks, FileText, CheckSquare } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "./file-card";
import { ApprovalsTab } from "./approvals-tab";

interface DocumentDetailViewProps {
  id: string;
}

const CATEGORIES = [
  "NDA", "PROCUREMENT_CONTRACT", "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT", "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY", "LEGAL_CORRESPONDENCE", "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT", "OTHER"
];

const RISK_LEVELS = ["UNKNOWN", "LOW", "MEDIUM", "HIGH"];

export function DocumentDetailView({ id }: DocumentDetailViewProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DocumentType>>({});

  const { data: document, isLoading, error } = useQuery({
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

  useEffect(() => {
    if (document) {
      setFormData({
        document_type: document.document_type || "OTHER",
        risk_level: document.risk_level || "UNKNOWN",
        vendor_name: document.vendor_name || "",
        business_unit: document.business_unit || "",
        effective_date: document.effective_date ? document.effective_date.split('T')[0] : "",
        expiry_date: document.expiry_date ? document.expiry_date.split('T')[0] : "",
      });
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DocumentType>) => documentApi.updateMetadata(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Metadata updated successfully");
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error("Failed to update metadata", { description: err.message });
    }
  });

  const summarizeMutation = useMutation({
    mutationFn: (force?: boolean) => documentApi.summarizeDocument(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      toast.success("AI Summary generated successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to generate summary", { description: err.message });
    }
  });

  if (isLoading) return <div className="flex items-center justify-center h-full min-h-[600px]"><Spinner /></div>;
  if (error || !document) return <div className="p-6 text-red-500">Failed to load document</div>;

  const handleSave = () => {
    updateMutation.mutate({
      document_type: formData.document_type,
      risk_level: formData.risk_level,
      vendor_name: formData.vendor_name,
      business_unit: formData.business_unit,
      effective_date: formData.effective_date ? new Date(formData.effective_date).toISOString() : undefined,
      expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : undefined,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Link href={`/dashboard/documents${document.folder_id ? `?folder_id=${document.folder_id}` : ''}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {document.filename}
            {document.document_type && <Badge variant="outline">{document.document_type}</Badge>}
            {document.risk_level && <Badge className={document.risk_level === 'HIGH' ? 'bg-red-500 hover:bg-red-600' : document.risk_level === 'MEDIUM' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}>{document.risk_level}</Badge>}
            {document.status === 'PENDING_APPROVAL' && <Badge className="bg-amber-500 hover:bg-amber-600">Menunggu Persetujuan</Badge>}
            {document.status === 'APPROVED' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Disetujui</Badge>}
            {document.status === 'REJECTED' && <Badge className="bg-red-500 hover:bg-red-600">Ditolak</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">{formatBytes(document.file_size_bytes)} • Uploaded by {document.uploaded_by}</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Metadata & Summary */}
        <div className="w-[450px] flex flex-col border-r bg-muted/10 h-full overflow-hidden">
          <Tabs defaultValue="metadata" className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-2 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metadata" className="text-xs">Metadata & AI</TabsTrigger>
                <TabsTrigger value="approvals" className="text-xs flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Persetujuan
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="metadata" className="flex-1 overflow-y-auto p-4 m-0">
              <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Metadata</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save</> : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground"><LayoutGrid className="w-4 h-4 mr-2" /> Category</Label>
                  {isEditing ? (
                    <Select value={formData.document_type} onValueChange={(v) => setFormData({...formData, document_type: v})}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium">{document.document_type || "-"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground"><ShieldAlert className="w-4 h-4 mr-2" /> Risk Level</Label>
                  {isEditing ? (
                    <Select value={formData.risk_level} onValueChange={(v) => setFormData({...formData, risk_level: v})}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Select Risk" /></SelectTrigger>
                      <SelectContent>
                        {RISK_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium">
                        {document.risk_level ? (
                          <span className={document.risk_level === 'HIGH' ? 'text-red-500' : document.risk_level === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}>
                            {document.risk_level}
                          </span>
                        ) : "-"}
                      </div>
                      {document.risk_reasoning && (
                        <div className={`p-3 border rounded-md text-xs leading-relaxed italic ${
                          document.risk_level === 'HIGH' ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50' : 
                          document.risk_level === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' : 
                          'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                        }`}>
                          <strong className="block mb-1 not-italic">Risk Reasoning:</strong>
                          {document.risk_reasoning}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center text-muted-foreground"><Building className="w-4 h-4 mr-2" /> Vendor Name</Label>
                    {isEditing ? (
                      <Input className="bg-background" value={formData.vendor_name || ""} onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} />
                    ) : (
                      <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium truncate" title={document.vendor_name}>{document.vendor_name || "-"}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center text-muted-foreground"><Building2 className="w-4 h-4 mr-2" /> Business Unit</Label>
                    {isEditing ? (
                      <Input className="bg-background" value={formData.business_unit || ""} onChange={(e) => setFormData({...formData, business_unit: e.target.value})} />
                    ) : (
                      <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium truncate" title={document.business_unit}>{document.business_unit || "-"}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center text-muted-foreground"><CalendarDays className="w-4 h-4 mr-2" /> Effective Date</Label>
                    {isEditing ? (
                      <Input className="bg-background" type="date" value={formData.effective_date || ""} onChange={(e) => setFormData({...formData, effective_date: e.target.value})} />
                    ) : (
                      <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium">{document.effective_date ? new Date(document.effective_date).toLocaleDateString() : "-"}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center text-muted-foreground"><CalendarDays className="w-4 h-4 mr-2" /> Expiry Date</Label>
                    {isEditing ? (
                      <Input className="bg-background" type="date" value={formData.expiry_date || ""} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
                    ) : (
                      <div className="p-2 bg-muted/50 border rounded-md text-sm font-medium">{document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : "-"}</div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* AI Summary Card */}
            <div className="mt-4 flex-1">
              <Card className="h-full flex flex-col border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-5 h-5 mr-2" /> AI Summary
                  </CardTitle>
                  <CardDescription>Ringkasan otomatis menggunakan LLM</CardDescription>
                </div>
                {document.summary && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => summarizeMutation.mutate(true)}
                    disabled={summarizeMutation.isPending}
                  >
                    {summarizeMutation.isPending ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Buat Ulang
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {document.summary ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    {(() => {
                      try {
                        const sumObj = JSON.parse(document.summary);
                        return (
                          <div className="space-y-4">
                            <div className="bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">
                              <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">Ringkasan Singkat:</strong>
                              <p className="mt-1 leading-relaxed text-emerald-900 dark:text-emerald-100">{sumObj.ringkasan_singkat}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-background p-3 rounded-md border shadow-sm">
                                <strong className="flex items-center text-emerald-700 dark:text-emerald-400 mb-2">
                                  <Building className="w-3 h-3 mr-1" /> Pihak Terlibat:
                                </strong>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">{sumObj.pihak_terlibat?.map((p:string, i:number) => <li key={i}>{p}</li>)}</ul>
                              </div>
                              <div className="bg-background p-3 rounded-md border shadow-sm">
                                <strong className="flex items-center text-emerald-700 dark:text-emerald-400 mb-2">
                                  <ListChecks className="w-3 h-3 mr-1" /> Kewajiban Utama:
                                </strong>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">{sumObj.kewajiban_utama?.map((k:string, i:number) => <li key={i}>{k}</li>)}</ul>
                              </div>
                            </div>
                            
                            <div className="bg-background p-3 rounded-md border shadow-sm text-xs">
                              <strong className="flex items-center text-emerald-700 dark:text-emerald-400 mb-2">
                                <FileText className="w-3 h-3 mr-1" /> Klausul Penting:
                              </strong>
                              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">{sumObj.klausul_penting?.map((k:string, i:number) => <li key={i}>{k}</li>)}</ul>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-background p-2 rounded-md border shadow-sm flex items-center">
                                <CalendarDays className="w-4 h-4 text-emerald-600 mr-2" />
                                <div>
                                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Masa Berlaku</span>
                                  <span className="font-medium">{sumObj.masa_berlaku}</span>
                                </div>
                              </div>
                              <div className="bg-background p-2 rounded-md border shadow-sm flex items-center">
                                <DollarSign className="w-4 h-4 text-emerald-600 mr-2" />
                                <div>
                                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nilai Kontrak</span>
                                  <span className="font-medium">{sumObj.nilai_kontrak}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } catch(e) {
                        return <div className="whitespace-pre-wrap">{document.summary}</div>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-center py-8">
                    <p className="text-sm text-muted-foreground">Belum ada ringkasan AI untuk dokumen ini.</p>
                    <Button 
                      onClick={() => summarizeMutation.mutate(false)} 
                      disabled={summarizeMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {summarizeMutation.isPending ? <Spinner className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Buat Ringkasan AI
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
            </TabsContent>

            <TabsContent value="approvals" className="flex-1 overflow-y-auto p-4 m-0">
              <ApprovalsTab documentId={id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: PDF Viewer */}
        <div className="flex-1 bg-neutral-900 relative">
          {isPdfLoading || !pdfUrl ? (
            <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-4">
              <Spinner />
              <span>Memuat dokumen PDF...</span>
            </div>
          ) : (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full border-none absolute inset-0"
              title="PDF Viewer"
            />
          )}
        </div>
      </div>
    </div>
  );
}
