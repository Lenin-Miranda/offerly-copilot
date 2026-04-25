import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { JobMatchDto } from './dto/job-match.dto';

@Injectable()
export class AnalysisService {
  private openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  async analyzeJobMatch(body: JobMatchDto) {
    const { resumeText, jobDescription } = body;

    const res = await this.openai.responses.create({
      model: 'gpt-5',
      input: [
        {
          role: 'system',
          content:
            'You are an expert career coach and technical recruiter. Analyze resumes against job posts and return practical, honest, structured feedback.',
        },
        {
          role: 'user',
          content: `
Resume:
${resumeText}

Job post:
${jobDescription}

Return valid JSON with:
matchScore, topStrengths, missingSkills, tailoredResumeBullets, recruiterMessage, shortCoverLetter, interviewQuestions.
          `,
        },
      ],
    });
    const text = res.output_text;

    return JSON.parse(text);
  }
}
