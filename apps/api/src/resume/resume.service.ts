import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { TailorResumeDto } from './dto/tailor-resume.dto';
import { ResumeStructure, TailorResumeResponse } from './resume.types';

@Injectable()
export class ResumeService {
  private openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async extractResumeStructure(resumeText: string): Promise<ResumeStructure> {
    if (!resumeText.trim()) {
      throw new BadRequestException('resumeText is required');
    }

    try {
      const res = await this.openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content:
              'You are an expert resume parser. Extract the structure of the resume and return valid JSON only.',
          },
          {
            role: 'user',
            content: `
Resume:
${resumeText}

Return valid JSON with:
- sectionOrder: string[]
- bulletStyle: "dash" | "dot" | "mixed"
- sections: { title: string; content: string[] }[]
- experiences: { company: string; title: string; dateRange: string; bullets: string[] }[]
- education: { school: string; degree: string; dateRange: string; bullets?: string[] }[]
        `,
          },
        ],
      });

      const text = res.output_text;
      return JSON.parse(text);
    } catch (error) {
      console.error('Error extracting resume structure:', error);
      throw new InternalServerErrorException(
        'Failed to extract resume structure',
      );
    }
  }

  async tailorResume(body: TailorResumeDto): Promise<TailorResumeResponse> {
    const { resumeText, jobDescription, resumeStructure } = body;

    if (!resumeText.trim() || !jobDescription.trim()) {
      throw new BadRequestException(
        'resumeText and jobDescription are required',
      );
    }

    try {
      const res = await this.openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content:
              'You are an expert career coach and resume writer. Tailor resumes to specific job descriptions while preserving the original structure.',
          },
          {
            role: 'user',
            content: `
Resume:
${resumeText}

Job post:
${jobDescription}

Resume structure:
${JSON.stringify(resumeStructure, null, 2)}

Return only the tailored resume text.
          `,
          },
        ],
      });

      const tailoredResume = res.output_text.trim();
      return { tailoredResume };
    } catch (error) {
      console.error('Error tailoring resume:', error);
      throw new InternalServerErrorException('Failed to tailor resume');
    }
  }
}
