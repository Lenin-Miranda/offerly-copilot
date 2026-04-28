import { useState } from "react";
import {
  extractResumeStructure,
  extractResumeText,
  tailorResume,
} from "../api/resume.ts";
import { logger } from "../lib/logger.ts";

type TailorButtonProps = {
  resumeFile: File | null;
  resumeText: string;
  jobDescription: string;
  disabled?: boolean;
  onTailored: (tailoredResume: string) => void;
};

export function TailorButton({
  resumeFile,
  resumeText,
  jobDescription,
  disabled = false,
  onTailored,
}: TailorButtonProps) {
  const [isTailoring, setIsTailoring] = useState(false);

  const handleTailor = async () => {
    if (
      disabled ||
      isTailoring ||
      resumeFile === null ||
      jobDescription.trim().length === 0
    ) {
      return;
    }

    setIsTailoring(true);

    try {
      logger.info("Starting resume tailoring");

      const nextResumeText =
        resumeText || (await extractResumeText(resumeFile));
      const resumeStructure = await extractResumeStructure(nextResumeText);
      const response = await tailorResume({
        resumeText: nextResumeText,
        jobDescription,
        resumeStructure,
      });

      onTailored(response.tailoredResume);
      logger.info("Resume tailoring completed");
    } catch (error) {
      logger.error("Resume tailoring failed", { error });
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <button
      className="tailor-button"
      type="button"
      onClick={handleTailor}
      disabled={
        disabled ||
        isTailoring ||
        resumeFile === null ||
        jobDescription.trim().length === 0
      }
    >
      <span className="tailor-button__label">
        {isTailoring ? "Tailoring..." : "Tailor Resume"}
      </span>
      <span className="tailor-button__meta">
        {isTailoring ? "..." : "AI"}
      </span>
    </button>
  );
}
