import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { FieldMappingService } from './field-mapping.service';
import {
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { StandardObject } from '../utils/types';

@Controller('field-mapping')
export class FieldMappingController {
  constructor(
    private readonly fieldMappingService: FieldMappingService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(FieldMappingController.name);
  }

  @Post('addObjectEntity')
  addStandardObjectEntity(@Body() standardObjectName: string) {
    return this.fieldMappingService.addStandardObjectEntity(standardObjectName);
  }

  @Get('getObjectEntity')
  getStandardObjectEntity(@Query() standardObjectName: string) {
    return this.fieldMappingService.getEntityId(
      standardObjectName as StandardObject,
    );
  }

  //define target field on our unified model
  @Post('define')
  defineTargetField(@Body() defineTargetFieldDto: DefineTargetFieldDto) {
    return this.fieldMappingService.defineTargetField(defineTargetFieldDto);
  }

  @Post('map')
  mapFieldToProvider(@Body() mapFieldToProviderDto: MapFieldToProviderDto) {
    return this.fieldMappingService.mapFieldToProvider(mapFieldToProviderDto);
  }
}
