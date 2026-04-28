import { ExportFormat } from '../export.types';

export class ExportResumeDto {
  tailoredResume!: string;
  format!: ExportFormat;
  fileName?: string;
}
