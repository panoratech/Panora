import { Module } from '@nestjs/common';
import { FieldMappingService } from './field-mapping.service';
import { FieldMappingController } from './field-mapping.controller';

@Module({
  providers: [FieldMappingService],
  controllers: [FieldMappingController],
})
export class FieldMappingModule {}
