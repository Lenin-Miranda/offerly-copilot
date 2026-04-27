export interface ResumeSection {
  title: string;
  content: string[];
}

export interface ResumeExperienceEntry {
  company: string;
  title: string;
  dateRange: string;
  bullets: string[];
}

export interface ResumeEducationEntry {
  school: string;
  degree: string;
  dateRange: string;
  bullets?: string[];
}

export interface ResumeStructure {
  sectionOrder: string[];
  bulletStyle: 'dash' | 'dot' | 'mixed';
  sections: ResumeSection[];
  experiences: ResumeExperienceEntry[];
  education?: ResumeEducationEntry[];
}

export interface TailorResumeResponse {
  tailoredResume: string;
}
