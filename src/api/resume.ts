import axios from "axios";
import type {
  ResumeStructure,
  TailorResumeRequest,
  TailorResumeResponse,
} from "../type/resume.types.ts";
import { logger } from "../lib/logger.ts";

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
