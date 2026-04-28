export type ExportFormat = "pdf" | "docx";

export interface ExportResumeRequest {
  tailoredResume: string;
  format: ExportFormat;
  fileName?: string;
}

export interface ExportResumeFile {
  blob: Blob;
  fileName: string;
  mimeType: string;
}
