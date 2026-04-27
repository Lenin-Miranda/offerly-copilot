import { Controller, Body, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JobMatchDto } from './dto/job-match.dto';
import { JobMatchResponse } from './analysis.types';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('job-match')
  analyzeJobMatch(@Body() body: JobMatchDto): Promise<JobMatchResponse> {
    return this.analysisService.analyzeJobMatch(body);
  }
}
