import { BadRequestException } from '@nestjs/common';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    service = new ExportService();
  });

  it('generates a docx file buffer', async () => {
    const result = await service.exportResume({
      tailoredResume: 'Jane Doe\n- Built dashboards\n- Improved onboarding',
      format: 'docx',
    });

    expect(result.fileName).toBe('tailored-resume.docx');
    expect(result.mimeType).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.byteLength).toBeGreaterThan(0);
  });

  it('generates a pdf file buffer', async () => {
    const result = await service.exportResume({
      tailoredResume: 'Jane Doe\nSenior Product Engineer',
      format: 'pdf',
      fileName: 'Jane Doe Resume',
    });

    expect(result.fileName).toBe('Jane-Doe-Resume.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.byteLength).toBeGreaterThan(0);
  });

  it('throws when tailored resume content is empty', async () => {
    await expect(
      service.exportResume({
        tailoredResume: '   ',
        format: 'pdf',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
