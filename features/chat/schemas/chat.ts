import type { ToolUIPart } from "ai";
import { nanoid } from "nanoid";

export interface MessageType {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  feedback?: any;
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
}

export const initialMessages: MessageType[] = [];

export const suggestions = [
  "Apa kebijakan mengenai cuti tahunan?",
  "Bagaimana prosedur pengunduran diri?",
  "Bantu saya me-review klausul kontrak ini",
  "Apa perbedaan PKWT dan PKWTT?",
  "Jelaskan regulasi tentang lembur",
  "Tolong analisis risiko dari dokumen MoU ini",
];
