import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ExportResumeDto } from './dto/export-resume';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('resume')
  async exportResume(
    @Body() body: ExportResumeDto,
    @Res() response: Response,
  ): Promise<void> {
    const file = await this.exportService.exportResume(body);

    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );
    response.send(file.buffer);
  }
}
