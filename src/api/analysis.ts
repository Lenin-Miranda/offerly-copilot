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
    if (axios.isAxiosError(error)) {
      const serverMessage =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : error.message;

      throw new Error(serverMessage || "Failed to analyze job match");
    }

    throw new Error("Failed to analyze job match");
  }
}
