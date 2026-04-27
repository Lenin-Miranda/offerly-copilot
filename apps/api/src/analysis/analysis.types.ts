export interface JobMatchRequest {
  resumeText: string;
  jobDescription: string;
}

export interface JobMatchResponse {
  matchScore: number;
  topStrengths: string[];
  missingSkills: string[];
  tailoredResumeBullets: string[];
  recruiterMessage: string;
  shortCoverLetter: string;
  interviewQuestions: string[];
}

export type AnalysisResult = 'idle' | 'loading' | 'success' | 'error';

export interface AnalysisError {
  message: string;
}
