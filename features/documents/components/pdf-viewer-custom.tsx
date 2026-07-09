"use client";

import { useTheme } from "next-themes";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useEffect, useState } from "react";

interface PdfViewerCustomProps {
  fileUrl: string;
}

export default function PdfViewerCustom({ fileUrl }: PdfViewerCustomProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Default layout plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-neutral-900" />;
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
      {/* 
        Using CDN for the worker to avoid configuring Next.js for pdfjs-dist. 
        Version must match the pdfjs-dist version installed (3.11.174).
      */}
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          theme={isDark ? "dark" : "light"}
        />
      </Worker>
    </div>
  );
}
