import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { TailorResumeDto } from './dto/tailor-resume.dto';

describe('ResumeService', () => {
  let service: ResumeService;
  let createMock: jest.Mock;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    service = new ResumeService();
    createMock = jest.fn();

    (service as unknown as { openai: unknown }).openai = {
      responses: {
        create: createMock,
      },
    };
  });

  describe('extractResumeStructure', () => {
    it('throws when resume text is missing', async () => {
      await expect(service.extractResumeStructure('   ')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns parsed resume structure', async () => {
      const structure = {
        sectionOrder: ['Summary', 'Experience'],
        bulletStyle: 'dot',
        sections: [{ title: 'Summary', content: ['Engineer'] }],
        experiences: [],
        education: [],
      };

      createMock.mockResolvedValue({
        output_text: JSON.stringify(structure),
      });

      await expect(
        service.extractResumeStructure('Resume text'),
      ).resolves.toEqual(structure);
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
        }),
      );
    });

    it('wraps OpenAI failures in an internal server error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      createMock.mockRejectedValue(new Error('OpenAI failed'));

      await expect(
        service.extractResumeStructure('Resume text'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('extractResumeText', () => {
    it('extracts text from plain text files', async () => {
      const file = {
        originalname: 'resume.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('Jane Doe\nSenior Engineer'),
      };

      await expect(service.extractResumeText(file)).resolves.toEqual({
        resumeText: 'Jane Doe\nSenior Engineer',
      });
    });

    it('throws when the file is missing', async () => {
      await expect(service.extractResumeText(undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects unsupported legacy doc files', async () => {
      const file = {
        originalname: 'resume.doc',
        mimetype: 'application/msword',
        buffer: Buffer.from('file'),
      };

      await expect(service.extractResumeText(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('tailorResume', () => {
    const body: TailorResumeDto = {
      resumeText: 'Resume text',
      jobDescription: 'Job description',
      resumeStructure: {
        sectionOrder: ['Summary'],
        bulletStyle: 'dot',
        sections: [{ title: 'Summary', content: ['Engineer'] }],
        experiences: [],
        education: [],
      },
    };

    it('throws when required text fields are missing', async () => {
      await expect(
        service.tailorResume({
          ...body,
          jobDescription: '   ',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns the tailored resume text', async () => {
      createMock.mockResolvedValue({
        output_text: 'Tailored resume content',
      });

      await expect(service.tailorResume(body)).resolves.toEqual({
        tailoredResume: 'Tailored resume content',
      });
    });

    it('wraps tailoring failures in an internal server error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      createMock.mockRejectedValue(new Error('OpenAI failed'));

      await expect(service.tailorResume(body)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
