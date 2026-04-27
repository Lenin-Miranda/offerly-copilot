import { useState } from "react";
import { saveAs } from "file-saver";
import { logger } from "../lib/logger.ts";

export const ExportButton = ({ content }: { content: string }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      logger.info("Starting resume export");

      // Give React one frame to paint the exporting state.
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "tailored_resume.txt");

      logger.info("Resume export completed");
    } catch (error) {
      logger.error("Resume export failed", { error });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Export Tailored Resume"}
    </button>
  );
};
