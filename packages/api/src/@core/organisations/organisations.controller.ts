import { Body, Controller, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { LoggerService } from '../logger/logger.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly organizationsService: OrganisationsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(OrganisationsController.name);
  }

  @Post('create')
  createOrg(@Body() orgCreateDto: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(orgCreateDto);
  }
}
