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
  CustomFieldResponse,
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import {
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { ApiPostCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('fieldMappings')
@Controller('field_mappings')
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
  @ApiExcludeEndpoint()
  @Get('internal/entities')
  getInternalEntities() {
    return this.fieldMappingService.getEntities();
  }

  @ApiOperation({
    operationId: 'getFieldMappings',
    summary: 'Retrieve field mappings',
  })
  @ApiResponse({ status: 200 })
  @ApiExcludeEndpoint()
  @Get('internal/attributes')
  @UseGuards(JwtAuthGuard)
  getInternalAttributes(@Request() req: any) {
    const { id_project } = req.user;
    return this.fieldMappingService.getAttributes(id_project);
  }

  @ApiOperation({
    operationId: 'getFieldMappingValues',
    summary: 'Retrieve field mappings values',
  })
  @ApiResponse({ status: 200 })
  @ApiExcludeEndpoint()
  @Get('internal/values')
  @UseGuards(JwtAuthGuard)
  getInternalValues() {
    return this.fieldMappingService.getValues();
  }

  @ApiOperation({
    operationId: 'definitions',
    summary: 'Define target Field',
  })
  @ApiBody({ type: DefineTargetFieldDto })
  @ApiExcludeEndpoint()
  @ApiPostCustomResponse(CustomFieldResponse)
  @Post('internal/define')
  @UseGuards(JwtAuthGuard)
  defineInternalTargetField(
    @Request() req: any,
    @Body() defineTargetFieldDto: DefineTargetFieldDto,
  ) {
    const { id_project } = req.user;
    return this.fieldMappingService.defineTargetField(
      defineTargetFieldDto,
      id_project,
    );
  }

  @ApiOperation({ operationId: 'map', summary: 'Map Custom Field' })
  @ApiBody({ type: MapFieldToProviderDto })
  @ApiPostCustomResponse(CustomFieldResponse)
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Post('internal/map')
  mapInternalFieldToProvider(
    @Body() mapFieldToProviderDto: MapFieldToProviderDto,
  ) {
    return this.fieldMappingService.mapFieldToProvider(mapFieldToProviderDto);
  }

  @ApiOperation({
    operationId: 'defineCustomField',
    summary: 'Create Custom Field',
  })
  @ApiExcludeEndpoint()
  @ApiBody({ type: CustomFieldCreateDto })
  @ApiPostCustomResponse(CustomFieldResponse)
  @Post('internal')
  @UseGuards(JwtAuthGuard)
  createInternalCustomField(
    @Request() req: any,
    @Body() data: CustomFieldCreateDto,
  ) {
    const { id_project } = req.user;
    return this.fieldMappingService.createCustomField(data, id_project);
  }

  @ApiOperation({
    operationId: 'getFieldMappingValues',
    summary: 'Retrieve field mappings values',
  })
  @ApiResponse({ status: 200 })
  @Get('values')
  @UseGuards(ApiKeyAuthGuard)
  getValues() {
    return this.fieldMappingService.getValues();
  }

  @ApiOperation({
    operationId: 'getFieldMappingsEntities',
    summary: 'Retrieve field mapping entities',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(ApiKeyAuthGuard)
  @Get('entities')
  getEntities() {
    return this.fieldMappingService.getEntities();
  }

  @ApiOperation({
    operationId: 'getFieldMappings',
    summary: 'Retrieve field mappings',
  })
  @ApiResponse({ status: 200 })
  @Get('attributes')
  @UseGuards(ApiKeyAuthGuard)
  getAttributes(@Request() req: any) {
    const { id_project } = req.user;
    return this.fieldMappingService.getAttributes(id_project);
  }

  @ApiOperation({
    operationId: 'definitions',
    summary: 'Define target Field',
  })
  @ApiBody({ type: DefineTargetFieldDto })
  @ApiPostCustomResponse(CustomFieldResponse)
  @Post('define')
  @UseGuards(ApiKeyAuthGuard)
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
    operationId: 'defineCustomField',
    summary: 'Create Custom Field',
  })
  @ApiBody({ type: CustomFieldCreateDto })
  @ApiPostCustomResponse(CustomFieldResponse)
  @Post()
  @UseGuards(ApiKeyAuthGuard)
  createCustomField(@Request() req: any, @Body() data: CustomFieldCreateDto) {
    const { id_project } = req.user;
    return this.fieldMappingService.createCustomField(data, id_project);
  }

  @ApiOperation({ operationId: 'map', summary: 'Map Custom Field' })
  @ApiBody({ type: MapFieldToProviderDto })
  @ApiPostCustomResponse(CustomFieldResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Post('map')
  mapFieldToProvider(@Body() mapFieldToProviderDto: MapFieldToProviderDto) {
    return this.fieldMappingService.mapFieldToProvider(mapFieldToProviderDto);
  }

  @ApiOperation({
    operationId: 'getCustomProviderProperties',
    summary: 'Retrieve Custom Properties',
  })
  @ApiResponse({ status: 200 })
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Get('internal/properties')
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
