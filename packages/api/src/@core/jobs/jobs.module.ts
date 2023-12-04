import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
