import { Module } from '@nestjs/common';
import { FieldMappingService } from './field-mapping.service';
import { FieldMappingController } from './field-mapping.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  providers: [FieldMappingService, PrismaService, LoggerService],
  controllers: [FieldMappingController],
})
export class FieldMappingModule {}
