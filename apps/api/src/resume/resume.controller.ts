import { Body, Controller, Post } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { TailorResumeDto } from './dto/tailor-resume.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('extract-structure')
  extractResumeStructure(@Body('resumeText') resumeText: string) {
    return this.resumeService.extractResumeStructure(resumeText);
  }

  @Post('tailor')
  tailorResume(@Body() body: TailorResumeDto) {
    return this.resumeService.tailorResume(body);
  }
}
