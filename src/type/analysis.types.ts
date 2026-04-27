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

export interface AnalysisFormState {
  resumeFile: File | null;
  resumeText: string;
  jobDescription: string;
}

export interface AnalysisFormInput {
  resumeFile: File | null;
  jobDescription: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  data: JobMatchResponse | null;
  error: string | null;
}

export interface AnalysisResultSection {
  title: string;
  items: string[];
}

export interface AnalysisViewModel {
  score: number;
  strengths: string[];
  gaps: string[];
  bullets: string[];
  recruiterMessage: string;
  coverLetter: string;
  interviewQuestions: string[];
}

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

export interface AnalysisFormInput {
  resumeFile: File | null;
  jobDescription: string;
}

export interface AnalysisState {
  status: AnalysisStatus;
  data: JobMatchResponse | null;
  error: string | null;
}
