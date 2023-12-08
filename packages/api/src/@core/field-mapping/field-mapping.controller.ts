import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { FieldMappingService } from './field-mapping.service';
import {
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { StandardObject } from '../utils/types';

interface StandardObjectDto {
  standardObjectName: string;
}
@Controller('field-mapping')
export class FieldMappingController {
  constructor(
    private readonly fieldMappingService: FieldMappingService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(FieldMappingController.name);
  }

  /*@Post('addObjectEntity')
  addStandardObjectEntity(@Body() dto: StandardObjectDto) {
    return this.fieldMappingService.addStandardObjectEntity(
      dto.standardObjectName,
    );
  }*/

  /*@Get('getObjectEntity')
  getStandardObjectEntity(@Query('object') standardObjectName: string) {
    return this.fieldMappingService.getEntityId(
      standardObjectName as StandardObject,
    );
  }*/

  @Get('entities')
  getEntities() {
    return this.fieldMappingService.getEntities();
  }

  @Get('attribute')
  getAttributes() {
    return this.fieldMappingService.getAttributes();
  }

  @Get('value')
  getValues() {
    return this.fieldMappingService.getValues();
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
