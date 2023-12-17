import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { LoggerService } from '../logger/logger.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('organisations')
@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly organizationsService: OrganisationsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(OrganisationsController.name);
  }

  @ApiOperation({ operationId: 'getOrganisations' })
  @Get()
  getOragnisations() {
    return this.organizationsService.getOrganisations();
  }

  @ApiOperation({ operationId: 'createOrganisation' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  createOrg(@Body() orgCreateDto: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(orgCreateDto);
  }
}
