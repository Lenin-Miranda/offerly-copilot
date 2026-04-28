import axios from "axios";
import { logger } from "../lib/logger.ts";
import type {
  ExportResumeFile,
  ExportResumeRequest,
} from "../type/export.types.ts";

function getFileNameFromDisposition(disposition?: string): string | null {
  if (!disposition) {
    return null;
  }

  const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fileNameMatch = disposition.match(/filename\s*=\s*"([^"]+)"/i);
  if (fileNameMatch?.[1]) {
    return fileNameMatch[1];
  }

  return null;
}

export async function exportResume(
  body: ExportResumeRequest,
): Promise<ExportResumeFile> {
  try {
    const response = await axios.post("/export/resume", body, {
      responseType: "blob",
    });

    const contentDispositionHeader = response.headers["content-disposition"];
    const contentTypeHeader = response.headers["content-type"];
    const contentDisposition =
      typeof contentDispositionHeader === "string"
        ? contentDispositionHeader
        : undefined;
    const mimeType =
      typeof contentTypeHeader === "string"
        ? contentTypeHeader
        : "application/octet-stream";
    const fallbackExtension = body.format === "pdf" ? "pdf" : "docx";
    const fileName =
      getFileNameFromDisposition(contentDisposition) ??
      `${body.fileName ?? "tailored-resume"}.${fallbackExtension}`;

    logger.info("Resume export completed", {
      fileName,
      format: body.format,
    });

    return {
      blob: response.data,
      fileName,
      mimeType,
    };
  } catch (error) {
    logger.error("Error exporting resume", { error, format: body.format });
    throw new Error("Failed to export resume");
  }
}
