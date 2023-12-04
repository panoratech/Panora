import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(JobsController.name);
  }

  @Get()
  async getJobs() {
    return await this.prisma.jobs.findMany();
  }
}
