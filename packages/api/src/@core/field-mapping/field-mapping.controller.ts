import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { FieldMappingService } from './field-mapping.service';
import {
  CustomFieldCreateDto,
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { ApiResponse, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

@ApiTags('field-mappings')
@Controller('field-mappings')
export class FieldMappingController {
  constructor(
    private readonly fieldMappingService: FieldMappingService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(FieldMappingController.name);
  }

  @ApiOperation({
    operationId: 'getFieldMappingsEntities',
    summary: 'Retrieve field mapping entities',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('entities')
  getEntities() {
    return this.fieldMappingService.getEntities();
  }

  @ApiOperation({
    operationId: 'getFieldMappings',
    summary: 'Retrieve field mappings',
  })
  @ApiResponse({ status: 200 })
  @Get('attribute')
  @UseGuards(JwtAuthGuard)
  getAttributes(@Request() req: any) {
    const { id_project } = req.user;
    return this.fieldMappingService.getAttributes(id_project);
  }

  @ApiOperation({
    operationId: 'getFieldMappingValues',
    summary: 'Retrieve field mappings values',
  })
  @ApiResponse({ status: 200 })
  @Get('value')
  @UseGuards(JwtAuthGuard)
  getValues() {
    return this.fieldMappingService.getValues();
  }

  @ApiOperation({
    operationId: 'defineTargetField',
    summary: 'Define target Field',
  })
  @ApiBody({ type: DefineTargetFieldDto })
  @ApiResponse({ status: 201 })
  //define target field on our unified model
  @Post('define')
  @UseGuards(JwtAuthGuard)
  defineTargetField(
    @Request() req: any,
    @Body() defineTargetFieldDto: DefineTargetFieldDto,
  ) {
    const { id_project } = req.user;
    return this.fieldMappingService.defineTargetField(
      defineTargetFieldDto,
      id_project,
    );
  }

  @ApiOperation({
    operationId: 'createCustomField',
    summary: 'Create Custom Field',
  })
  @ApiBody({ type: CustomFieldCreateDto })
  @ApiResponse({ status: 201 })
  @Post()
  @UseGuards(JwtAuthGuard)
  createCustomField(@Request() req: any, @Body() data: CustomFieldCreateDto) {
    const { id_project } = req.user;
    return this.fieldMappingService.createCustomField(data, id_project);
  }

  @ApiOperation({ operationId: 'mapField', summary: 'Map Custom Field' })
  @ApiBody({ type: MapFieldToProviderDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('map')
  mapFieldToProvider(@Body() mapFieldToProviderDto: MapFieldToProviderDto) {
    return this.fieldMappingService.mapFieldToProvider(mapFieldToProviderDto);
  }

  @ApiOperation({
    operationId: 'getCustomProviderProperties',
    summary: 'Retrieve Custom Properties',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('properties')
  getCustomProperties(
    @Query('linkedUserId') linkedUserId: string,
    @Query('providerId') providerId: string,
    @Query('vertical') vertical: string,
  ) {
    return this.fieldMappingService.getCustomProperties(
      linkedUserId,
      providerId,
      vertical,
    );
  }
}
