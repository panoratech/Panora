import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MagicLinkController } from './magic-link.controller';
import { MagicLinkService } from './magic-link.service';

@Module({
  controllers: [MagicLinkController],
  providers: [MagicLinkService, JwtService],
})
export class MagicLinkModule {}
