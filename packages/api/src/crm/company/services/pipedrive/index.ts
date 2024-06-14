import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { PipedriveCompanyInput, PipedriveCompanyOutput } from './types';

@Injectable()
export class PipedriveService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addCompany(
    companyData: PipedriveCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/organizations`,
        JSON.stringify(companyData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Pipedrive company created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.company,
        ActionType.POST,
      );
    }
    return;
  }

  async syncCompanies(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveCompanyOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`${connection.account_url}/organizations`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.company,
        ActionType.GET,
      );
    }
  }
}
