import { Test, TestingModule } from '@nestjs/testing';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { TailorResumeDto } from './dto/tailor-resume.dto';

describe('ResumeController', () => {
  let controller: ResumeController;
  let resumeService: {
    extractResumeText: jest.Mock;
    extractResumeStructure: jest.Mock;
    tailorResume: jest.Mock;
  };

  beforeEach(async () => {
    resumeService = {
      extractResumeText: jest.fn(),
      extractResumeStructure: jest.fn(),
      tailorResume: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [
        {
          provide: ResumeService,
          useValue: resumeService,
        },
      ],
    }).compile();

    controller = module.get<ResumeController>(ResumeController);
  });

  it('delegates text extraction to the resume service', async () => {
    const file = {
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('file'),
    };
    const response = { resumeText: 'Extracted text' };

    resumeService.extractResumeText.mockResolvedValue(response);

    await expect(controller.extractResumeText(file)).resolves.toEqual(response);
    expect(resumeService.extractResumeText).toHaveBeenCalledWith(file);
  });

  it('delegates structure extraction to the resume service', async () => {
    const structure = {
      sectionOrder: ['Summary'],
      bulletStyle: 'dot',
      sections: [{ title: 'Summary', content: ['Product engineer'] }],
      experiences: [],
      education: [],
    };

    resumeService.extractResumeStructure.mockResolvedValue(structure);

    await expect(
      controller.extractResumeStructure('Resume text'),
    ).resolves.toEqual(structure);
    expect(resumeService.extractResumeStructure).toHaveBeenCalledWith(
      'Resume text',
    );
  });

  it('delegates tailoring to the resume service', async () => {
    const body: TailorResumeDto = {
      resumeText: 'Resume text',
      jobDescription: 'Job description',
      resumeStructure: {
        sectionOrder: ['Summary'],
        bulletStyle: 'dot',
        sections: [{ title: 'Summary', content: ['Product engineer'] }],
        experiences: [],
        education: [],
      },
    };
    const response = { tailoredResume: 'Tailored content' };

    resumeService.tailorResume.mockResolvedValue(response);

    await expect(controller.tailorResume(body)).resolves.toEqual(response);
    expect(resumeService.tailorResume).toHaveBeenCalledWith(body);
  });
});
