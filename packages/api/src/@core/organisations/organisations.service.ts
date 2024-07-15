import { Injectable } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { PrismaService } from '../@core-services/prisma/prisma.service';

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
