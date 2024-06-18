import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OrganisationsService.name);
  }

  /*async getOrganisations() {
    try {
      return await this.prisma.organizations.findMany();
    } catch (error) {
    }
  }
  async createOrganization(data: CreateOrganizationDto) {
    try {
      const res = await this.prisma.organizations.create({
        data: {
          ...data,
          id_organization: uuidv4(),
        },
      });
      return res;
    } catch (error) {
    }
  }*/
}
