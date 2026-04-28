import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { JobMatchDto } from './dto/job-match.dto';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let analysisService: { analyzeJobMatch: jest.Mock };

  beforeEach(async () => {
    analysisService = {
      analyzeJobMatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        {
          provide: AnalysisService,
          useValue: analysisService,
        },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
  });

  it('delegates the request to the analysis service', async () => {
    const body: JobMatchDto = {
      resumeText: 'Resume text',
      jobDescription: 'Job description',
    };
    const result = {
      matchScore: 88,
      topStrengths: ['TypeScript'],
      missingSkills: ['Kubernetes'],
      tailoredResumeBullets: ['Improved delivery speed by 24%'],
      recruiterMessage: 'Strong fit',
      shortCoverLetter: 'Short note',
      interviewQuestions: ['How do you prioritize work?'],
    };

    analysisService.analyzeJobMatch.mockResolvedValue(result);

    await expect(controller.analyzeJobMatch(body)).resolves.toEqual(result);
    expect(analysisService.analyzeJobMatch).toHaveBeenCalledWith(body);
  });
});
