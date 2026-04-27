import axios from "axios";
import type {
  JobMatchRequest,
  JobMatchResponse,
} from "../type/analysis.types.ts";

export async function analyzeJobMatch(payload: JobMatchRequest) {
  try {
    const { data } = await axios.post<JobMatchResponse>(
      "/api/analysis/job-match",
      payload,
    );

    return data;
  } catch (error) {
    console.error("Error analyzing job match:", error);
  }
}
