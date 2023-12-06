import { Module } from '@nestjs/common';
import { PassthroughService } from './passthrough.service';
import { PassthroughController } from './passthrough.controller';
import { LoggerService } from '@@core/logger/logger.service';

@Module({
  providers: [PassthroughService, LoggerService],
  controllers: [PassthroughController],
})
export class PassthroughModule {}
