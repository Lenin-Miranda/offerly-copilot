import axios from "axios";
import type {
  JobMatchRequest,
  JobMatchResponse,
} from "../type/analysis.types.ts";
import { logger } from "../lib/logger.ts";

export async function analyzeJobMatch(
  payload: JobMatchRequest,
): Promise<JobMatchResponse> {
  try {
    const { data } = await axios.post<JobMatchResponse>(
      "/analysis/job-match",
      payload,
    );

    logger.info("Job match analysis completed");
    return data;
  } catch (error) {
    logger.error("Error analyzing job match", { error });
    throw new Error("Failed to analyze job match");
  }
}
