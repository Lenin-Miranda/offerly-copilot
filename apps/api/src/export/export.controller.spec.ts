import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportResumeDto } from './dto/export-resume';

describe('ExportController', () => {
  let controller: ExportController;
  let exportService: { exportResume: jest.Mock };

  beforeEach(async () => {
    exportService = {
      exportResume: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [
        {
          provide: ExportService,
          useValue: exportService,
        },
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
  });

  it('sets response headers and sends the exported file', async () => {
    const body: ExportResumeDto = {
      tailoredResume: 'Tailored resume',
      format: 'docx',
      fileName: 'resume',
    };
    const response = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    exportService.exportResume.mockResolvedValue({
      fileName: 'resume.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('file'),
    });

    await controller.exportResume(body, response);

    expect(exportService.exportResume).toHaveBeenCalledWith(body);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="resume.docx"',
    );
    expect(response.send).toHaveBeenCalledWith(Buffer.from('file'));
  });
});
