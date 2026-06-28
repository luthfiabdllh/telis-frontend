"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { redlineApi, RedlineJob, RedlineStatus } from "../api/redline-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RedlineInterface() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [status, setStatus] = useState<RedlineStatus | "IDLE" | "UPLOADING">("IDLE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "source" | "target") => {
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
          setResult(job.analysis_result || "");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (status === "PROCESSING") {
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
    setResult("");
    setErrorMsg("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const exportToPdf = () => {
    // For simplicity, trigger print dialog which allows "Save as PDF"
    // In a more robust solution, we'd use html2pdf.js or similar
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Redline Analysis Report</title>
            <style>
              body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>Smart Redlining Analysis</h2>
            <div>${result.replace(/\n/g, '<br/>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (status === "COMPLETED" || status === "FAILED") {
    return (
      <div className="flex flex-col h-full w-full p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {status === "COMPLETED" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {status === "COMPLETED" ? "Analisis Selesai" : "Analisis Gagal"}
          </h3>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Mulai Baru
          </Button>
        </div>

        {status === "COMPLETED" && (
          <div className="flex gap-2 mb-4">
            <Button variant="secondary" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="secondary" size="sm" onClick={exportToPdf}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}

        <Card className="flex-1 bg-white dark:bg-zinc-950/50">
          <CardContent className="p-4 prose prose-sm dark:prose-invert max-w-none">
            {status === "FAILED" ? (
              <div className="text-red-500">{result || errorMsg}</div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "UPLOADING" || status === "PROCESSING" || status === "PENDING") {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-zinc-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-medium text-foreground">
          {status === "UPLOADING" ? "Mengunggah Dokumen..." : "Menganalisis Perubahan..."}
        </p>
        <p className="text-sm mt-2 text-center max-w-xs">
          Legal Engine sedang membandingkan klausa dan mendeteksi risiko. Mohon tunggu sebentar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Smart Redlining</h3>
        <p className="text-sm text-muted-foreground">
          Bandingkan dua versi kontrak untuk mendeteksi perubahan klausa dan risiko secara otomatis. Hanya mendukung PDF (Maks 10MB).
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-6 flex-1">
        {/* Source File */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dokumen Asli (Source)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {sourceFile ? (
                <FileText className="w-8 h-8 text-primary mb-2" />
              ) : (
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {sourceFile ? sourceFile.name : "Klik untuk unggah PDF asli"}
              </p>
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Dokumen Revisi (Target)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {targetFile ? (
                <FileText className="w-8 h-8 text-primary mb-2" />
              ) : (
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {targetFile ? targetFile.name : "Klik untuk unggah PDF revisi"}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, "target")}
            />
          </label>
        </div>

        <Button 
          className="mt-4 w-full" 
          size="lg"
          disabled={!sourceFile || !targetFile}
          onClick={handleUpload}
        >
          Analyze Changes
        </Button>
      </div>
    </div>
  );
}
