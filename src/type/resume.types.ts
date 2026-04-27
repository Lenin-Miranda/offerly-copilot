export interface ResumeStructure {
  sectionOrder: string[];
  bulletStyle: "dash" | "dot" | "mixed";
  sections: { title: string; content: string[] }[];
  experiences: {
    company: string;
    title: string;
    dateRange: string;
    bullets: string[];
  }[];
  education?: {
    school: string;
    degree: string;
    dateRange: string;
    bullets?: string[];
  }[];
}

export interface TailorResumeResponse {
  tailoredResume: string;
}

export interface TailorResumeRequest {
  resumeText: string;
  resumeStructure: ResumeStructure;
  jobDescription: string;
}
