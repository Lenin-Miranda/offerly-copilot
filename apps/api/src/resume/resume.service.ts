import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';
import { TailorResumeDto } from './dto/tailor-resume.dto';
import {
  ExtractResumeTextResponse,
  ResumeStructure,
  TailorResumeResponse,
} from './resume.types';

type UploadedResumeFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class ResumeService {
  private openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async extractResumeText(
    file: UploadedResumeFile | undefined,
  ): Promise<ExtractResumeTextResponse> {
    if (!file) {
      throw new BadRequestException('resume file is required');
    }

    try {
      const fileName = file.originalname.toLowerCase();
      const mimeType = file.mimetype;
      let resumeText = '';

      if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const parser = new PDFParse({ data: file.buffer });
        const parsed = await parser.getText();
        resumeText = parsed.text;
        await parser.destroy();
      } else if (
        mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        const parsed = await mammoth.extractRawText({ buffer: file.buffer });
        resumeText = parsed.value;
      } else if (mimeType.startsWith('text/') || fileName.endsWith('.txt')) {
        resumeText = file.buffer.toString('utf-8');
      } else if (fileName.endsWith('.doc')) {
        throw new BadRequestException(
          'DOC files are not supported yet. Please upload PDF, DOCX, or TXT.',
        );
      } else {
        throw new BadRequestException(
          'Unsupported file type. Please upload PDF, DOCX, or TXT.',
        );
      }

      const normalizedText = resumeText
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!normalizedText) {
        throw new BadRequestException(
          'We could not extract readable text from that file.',
        );
      }

      return { resumeText: normalizedText };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error extracting resume text:', error);
      throw new InternalServerErrorException('Failed to extract resume text');
    }
  }

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
