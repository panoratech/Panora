import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { FieldMappingService } from './field-mapping.service';
import {
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('field-mapping')
@Controller('field-mapping')
export class FieldMappingController {
  constructor(
    private readonly fieldMappingService: FieldMappingService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(FieldMappingController.name);
  }

  @ApiResponse({ status: 200 })
  @Get('entities')
  getEntities() {
    return this.fieldMappingService.getEntities();
  }

  @ApiResponse({ status: 200 })
  @Get('attribute')
  getAttributes() {
    return this.fieldMappingService.getAttributes();
  }

  @ApiResponse({ status: 200 })
  @Get('value')
  getValues() {
    return this.fieldMappingService.getValues();
  }

  @ApiBody({ type: DefineTargetFieldDto })
  @ApiResponse({ status: 201 })
  //define target field on our unified model
  @Post('define')
  defineTargetField(@Body() defineTargetFieldDto: DefineTargetFieldDto) {
    return this.fieldMappingService.defineTargetField(defineTargetFieldDto);
  }

  @ApiBody({ type: MapFieldToProviderDto })
  @ApiResponse({ status: 201 })
  @Post('map')
  mapFieldToProvider(@Body() mapFieldToProviderDto: MapFieldToProviderDto) {
    return this.fieldMappingService.mapFieldToProvider(mapFieldToProviderDto);
  }
}
