import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { TailorResumeDto } from './dto/tailor-resume.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('extract-text')
  @UseInterceptors(FileInterceptor('file'))
  extractResumeText(
    @UploadedFile()
    file:
      | { originalname: string; mimetype: string; buffer: Buffer }
      | undefined,
  ) {
    return this.resumeService.extractResumeText(file);
  }

  @Post('extract-structure')
  extractResumeStructure(@Body('resumeText') resumeText: string) {
    return this.resumeService.extractResumeStructure(resumeText);
  }

  @Post('tailor')
  tailorResume(@Body() body: TailorResumeDto) {
    return this.resumeService.tailorResume(body);
  }
}
