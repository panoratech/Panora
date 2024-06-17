import { Module } from '@nestjs/common';
import { MagicLinkController } from './magic-link.controller';
import { MagicLinkService } from './magic-link.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [MagicLinkController],
  providers: [MagicLinkService, LoggerService, JwtService],
})
export class MagicLinkModule {}
