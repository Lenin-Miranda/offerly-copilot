import { useState } from "react";
import { saveAs } from "file-saver";
import { exportResume } from "../api/export.ts";
import { logger } from "../lib/logger.ts";
import type { ExportFormat } from "../type/export.types.ts";

type ExportButtonProps = {
  content: string;
  format?: ExportFormat;
  fileName?: string;
};

export const ExportButton = ({
  content,
  format = "docx",
  fileName = "tailored-resume",
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!content.trim() || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      logger.info("Starting resume export", { format });

      // Give React one frame to paint the exporting state.
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      const file = await exportResume({
        tailoredResume: content,
        format,
        fileName,
      });
      const blob = new Blob([file.blob], { type: file.mimeType });

      saveAs(blob, file.fileName);

      logger.info("Resume download started", {
        fileName: file.fileName,
        format,
      });
    } catch (error) {
      logger.error("Resume export failed", { error });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-button"
      type="button"
      onClick={handleExport}
      disabled={isExporting}
    >
      <span className="export-button__label">
        {isExporting ? "Exporting..." : "Export Resume"}
      </span>
      <span className="export-button__meta">
        {isExporting ? "..." : format.toUpperCase()}
      </span>
    </button>
  );
};
