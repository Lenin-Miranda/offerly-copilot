import { AnalysisService } from './analysis.service';
import { JobMatchDto } from './dto/job-match.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let createMock: jest.Mock;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    service = new AnalysisService();
    createMock = jest.fn();

    (service as unknown as { openai: unknown }).openai = {
      responses: {
        create: createMock,
      },
    };
  });

  it('returns parsed JSON from OpenAI', async () => {
    const body: JobMatchDto = {
      resumeText: 'Resume text',
      jobDescription: 'Job description',
    };
    const response = {
      matchScore: 91,
      topStrengths: ['React'],
      missingSkills: ['AWS'],
      tailoredResumeBullets: ['Built dashboards'],
      recruiterMessage: 'Great candidate',
      shortCoverLetter: 'Cover note',
      interviewQuestions: ['Tell me about a migration'],
    };

    createMock.mockResolvedValue({
      output_text: JSON.stringify(response),
    });

    await expect(service.analyzeJobMatch(body)).resolves.toEqual(response);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5',
      }),
    );
  });

  it('throws when OpenAI returns invalid JSON', async () => {
    createMock.mockResolvedValue({
      output_text: 'not-json',
    });

    await expect(
      service.analyzeJobMatch({
        resumeText: 'Resume text',
        jobDescription: 'Job description',
      }),
    ).rejects.toThrow();
  });
});
