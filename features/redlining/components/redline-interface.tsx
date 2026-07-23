"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Activity,
  ArrowRight,
  ShieldAlert,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redlineApi, RedlineJob, RedlineStatus } from "../api/redline-api";

interface RedlineChange {
  type: "ADDED" | "MODIFIED" | "DELETED";
  clause: string;
  old_text?: string;
  new_text?: string;
  impact: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
}

interface RedlineResult {
  risk_score: number;
  summary: string;
  changes: RedlineChange[];
}

export function RedlineInterface() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [status, setStatus] = useState<RedlineStatus | "IDLE" | "UPLOADING">(
    "IDLE",
  );
  const [jobId, setJobId] = useState<string | null>(null);

  // Store raw result in case it's not JSON
  const [rawResult, setRawResult] = useState<string>("");
  // Parsed JSON result
  const [parsedResult, setParsedResult] = useState<RedlineResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "source" | "target",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Hanya format PDF yang didukung.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 10MB.");
      return;
    }

    setErrorMsg("");
    if (type === "source") {
      setSourceFile(file);
    } else {
      setTargetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!sourceFile || !targetFile) return;

    try {
      setStatus("UPLOADING");
      setErrorMsg("");
      const res = await redlineApi.uploadRedline(sourceFile, targetFile);
      setJobId(res.job_id);
      setStatus("PROCESSING");
    } catch (err: any) {
      console.error(err);
      setStatus("FAILED");
      setErrorMsg(err.message || "Gagal mengunggah dokumen.");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!jobId) return;
      try {
        const job = await redlineApi.getRedlineJob(jobId);
        setStatus(job.status);

        if (job.status === "COMPLETED" || job.status === "FAILED") {
          const resultStr = job.analysis_result || "";
          setRawResult(resultStr);

          if (job.status === "COMPLETED") {
            try {
              // Extract JSON if there's markdown wrapping
              let jsonStr = resultStr;
              if (resultStr.includes("```json")) {
                jsonStr = resultStr.split("```json")[1].split("```")[0].trim();
              } else if (resultStr.includes("```")) {
                jsonStr = resultStr.split("```")[1].split("```")[0].trim();
              }
              const json = JSON.parse(jsonStr) as RedlineResult;
              setParsedResult(json);
            } catch (e) {
              console.warn(
                "Failed to parse LLM result as JSON, falling back to raw text.",
              );
              // We'll fallback to raw text view
            }
          }

          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (status === "PROCESSING" || status === "PENDING") {
      interval = setInterval(pollStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, jobId]);

  const handleReset = () => {
    setSourceFile(null);
    setTargetFile(null);
    setStatus("IDLE");
    setJobId(null);
    setRawResult("");
    setParsedResult(null);
    setErrorMsg("");
    setExpandedRow(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawResult);
  };

  const exportToPdf = () => {
    window.print();
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-red-500";
    if (score >= 4) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getRiskBg = (score: number) => {
    if (score >= 8) return "bg-red-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  if (status === "COMPLETED" || status === "FAILED") {
    return (
      <div className="flex flex-col h-full w-full p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {status === "COMPLETED" ? (
                <ShieldAlert className="w-6 h-6 text-primary" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              {status === "COMPLETED"
                ? "Laporan Audit Redline"
                : "Analisis Gagal"}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Hasil komparasi dokumen secara otomatis menggunakan AI Legal
              Engine.
            </p>
          </div>
          <div className="flex gap-2">
            {status === "COMPLETED" && (
              <Button variant="outline" size="sm" onClick={exportToPdf}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Button variant="default" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Audit Baru
            </Button>
          </div>
        </div>

        {status === "FAILED" && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {rawResult || errorMsg}
              </div>
            </CardContent>
          </Card>
        )}

        {status === "COMPLETED" && !parsedResult && (
          <Card className="flex-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
              <p className="text-yellow-600 text-sm font-medium mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Format tidak sesuai (JSON tidak ditemukan). Menampilkan teks
                mentah:
              </p>
              <pre className="whitespace-pre-wrap">{rawResult}</pre>
            </CardContent>
          </Card>
        )}

        {status === "COMPLETED" && parsedResult && (
          <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm overflow-hidden relative">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${getRiskBg(parsedResult.risk_score)}`}
                />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">
                        Skor Risiko Keseluruhan
                      </p>
                      <h4
                        className={`text-5xl font-black mt-2 tracking-tight ${getRiskColor(parsedResult.risk_score)}`}
                      >
                        {parsedResult.risk_score}
                        <span className="text-2xl text-zinc-400">/10</span>
                      </h4>
                    </div>
                    <Activity
                      className={`w-8 h-8 opacity-20 ${getRiskColor(parsedResult.risk_score)}`}
                    />
                  </div>
                  <Progress
                    value={parsedResult.risk_score * 10}
                    className="h-2 mt-4"
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Ringkasan Eksekutif Dampak Hukum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {parsedResult.summary}
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>
                        {
                          parsedResult.changes.filter(
                            (c) => c.type === "DELETED",
                          ).length
                        }{" "}
                        Dihapus
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <span>
                        {
                          parsedResult.changes.filter((c) => c.type === "ADDED")
                            .length
                        }{" "}
                        Ditambah
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>
                        {
                          parsedResult.changes.filter(
                            (c) => c.type === "MODIFIED",
                          ).length
                        }{" "}
                        Diubah
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Changes Table */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-primary" />
                  Rincian Perubahan Klausul
                </CardTitle>
                <CardDescription>
                  Klik pada baris tabel untuk melihat komparasi teks lama dan
                  teks baru secara rinci.
                </CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[200px]">
                        Pasal / Klausul
                      </TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tingkat Risiko</TableHead>
                      <TableHead className="w-[400px]">Dampak Hukum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedResult.changes.map((change, idx) => (
                      <React.Fragment key={idx}>
                        <TableRow
                          className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          onClick={() =>
                            setExpandedRow(expandedRow === idx ? null : idx)
                          }
                        >
                          <TableCell className="font-medium align-top">
                            {change.clause}
                          </TableCell>
                          <TableCell className="align-top">
                            {change.type === "ADDED" && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                ADDED
                              </Badge>
                            )}
                            {change.type === "DELETED" && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
                                DELETED
                              </Badge>
                            )}
                            {change.type === "MODIFIED" && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                MODIFIED
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            {change.risk_level === "LOW" && (
                              <Badge
                                variant="outline"
                                className="text-emerald-600 border-emerald-200"
                              >
                                LOW
                              </Badge>
                            )}
                            {change.risk_level === "MEDIUM" && (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-200"
                              >
                                MEDIUM
                              </Badge>
                            )}
                            {change.risk_level === "HIGH" && (
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-200 font-bold"
                              >
                                HIGH
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="align-top text-zinc-600 dark:text-zinc-400 text-sm">
                            {change.impact}
                          </TableCell>
                        </TableRow>
                        {expandedRow === idx && (
                          <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-50/80 border-b">
                            <TableCell colSpan={4} className="p-0">
                              <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                                <div className="p-4 bg-white dark:bg-zinc-950">
                                  <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    Teks Lama (Source)
                                  </div>
                                  <div className="text-sm text-red-600/80 dark:text-red-400/80 line-through decoration-red-500/50 whitespace-pre-wrap">
                                    {change.old_text || "-"}
                                  </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-zinc-950">
                                  <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    Teks Baru (Target)
                                  </div>
                                  <div className="text-sm text-emerald-600/90 dark:text-emerald-400/90 whitespace-pre-wrap">
                                    {change.new_text || "-"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                    {parsedResult.changes.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-zinc-500"
                        >
                          Tidak ditemukan perubahan signifikan pada kedua
                          dokumen.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (
    status === "UPLOADING" ||
    status === "PROCESSING" ||
    status === "PENDING"
  ) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950/20">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            <Activity className="w-8 h-8 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {status === "UPLOADING"
              ? "Mengunggah Dokumen..."
              : "Mengaudit Kontrak..."}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {status === "UPLOADING"
              ? "Harap tunggu sementara dokumen Anda dipindahkan ke zona aman."
              : "Agent AI sedang mengekstrak teks, membandingkan klausul demi klausul, dan menghitung risiko hukum. Proses ini mungkin memakan waktu hingga 1 menit."}
          </p>

          {status !== "UPLOADING" && (
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Ekstraksi Teks (OCR)
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-primary animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Analisis LLM (Groq)
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />{" "}
                Komputasi Risk Score
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-8 max-w-5xl mx-auto">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Smart Redline
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Unggah dokumen kontrak asli dan versi revisi. AI Legal Engine kami
          akan secara otomatis membandingkan setiap pasal, mendeteksi
          penambahan, penghapusan, dan potensi risiko hukum tersembunyi dalam
          hitungan detik.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="pt-0.5">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Source File */}
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-wide uppercase text-zinc-500">
            Kontrak Asli (Source)
          </label>
          <label
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${sourceFile ? "bg-primary/5 border-primary/30" : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {sourceFile ? (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-1 line-clamp-1">
                    {sourceFile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(sourceFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    Klik atau seret PDF asli ke sini
                  </p>
                  <p className="text-xs text-zinc-500">
                    Maksimal 10MB per dokumen
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, "source")}
            />
          </label>
        </div>

        {/* Target File */}
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-wide uppercase text-zinc-500">
            Kontrak Revisi (Target)
          </label>
          <label
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${targetFile ? "bg-primary/5 border-primary/30" : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {targetFile ? (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-1 line-clamp-1">
                    {targetFile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(targetFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    Klik atau seret PDF revisi ke sini
                  </p>
                  <p className="text-xs text-zinc-500">
                    Maksimal 10MB per dokumen
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, "target")}
            />
          </label>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          size="lg"
          className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-all"
          disabled={!sourceFile || !targetFile}
          onClick={handleUpload}
        >
          Mulai Audit Redline
          <ArrowRight className="w-5 h-5 ml-3 opacity-70" />
        </Button>
      </div>
    </div>
  );
}
