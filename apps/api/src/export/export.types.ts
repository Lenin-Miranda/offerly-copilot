export type ExportFormat = 'pdf' | 'docx';

export interface ExportResumeRequest {
  tailoredResume: string;
  format: ExportFormat;
  fileName?: string;
}

export interface ExportResumeFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}
export interface ExportResumeMetadata {
  fileName: string;
  mimeType: string;
  format: ExportFormat;
}
