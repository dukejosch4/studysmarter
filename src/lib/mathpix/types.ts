// Mathpix API Types

export type MathpixConversionFormat = "mmd" | "docx" | "tex.zip" | "html" | "md";

export type MathpixJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "error";

export type MathpixSubmitOptions = {
  /** Conversion formats to request */
  conversionFormats?: MathpixConversionFormat[];
  /** Enable alphabets detection (e.g., Greek, Cyrillic) */
  enableTablesDetection?: boolean;
  /** Include line data in results */
  includeLineData?: boolean;
  /** Callback URL for webhook */
  callbackUrl?: string;
};

export type MathpixSubmitResponse = {
  pdf_id: string;
  status?: string;
  error?: string;
};

export type MathpixStatusResponse = {
  pdf_id: string;
  status: MathpixJobStatus;
  num_pages?: number;
  num_pages_completed?: number;
  percent_done?: number;
  error?: string;
};

export type MathpixResultPage = {
  page: number;
  text: string;
  confidence?: number;
};

export type MathpixConversionResult = {
  pdf_id: string;
  status: "completed" | "error";
  mmd?: string; // Full MMD (Mathpix Markdown) text
  pages?: MathpixResultPage[];
  num_pages?: number;
  error?: string;
};

export type MathpixWebhookPayload = {
  pdf_id: string;
  status: "completed" | "error";
  num_pages?: number;
  error?: string;
};
