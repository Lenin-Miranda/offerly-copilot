import axios from "axios";
import type {
  ExtractResumeTextResponse,
  ResumeStructure,
  TailorResumeRequest,
  TailorResumeResponse,
} from "../type/resume.types.ts";
import { logger } from "../lib/logger.ts";

export async function extractResumeText(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post<ExtractResumeTextResponse>(
      "/resume/extract-text",
      formData,
    );

    logger.info("Resume text extracted");
    return data.resumeText;
  } catch (error) {
    logger.error("Error extracting resume text", { error });
    throw new Error("Failed to extract resume text");
  }
}

export async function tailorResume(
  body: TailorResumeRequest,
): Promise<TailorResumeResponse> {
  try {
    const { data } = await axios.post<TailorResumeResponse>(
      "/resume/tailor",
      body,
    );

    logger.info("Resume tailoring completed");
    return data;
  } catch (error) {
    logger.error("Error tailoring resume", { error });
    throw new Error("Failed to tailor resume");
  }
}

export async function extractResumeStructure(
  resumeText: string,
): Promise<ResumeStructure> {
  try {
    const { data } = await axios.post<ResumeStructure>(
      "/resume/extract-structure",
      {
        resumeText,
      },
    );

    logger.info("Resume structure extracted");
    return data;
  } catch (error) {
    logger.error("Error extracting resume structure", { error });
    throw new Error("Failed to extract resume structure");
  }
}
