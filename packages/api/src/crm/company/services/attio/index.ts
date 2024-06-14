/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { AttioCompanyInput, AttioCompanyOutput } from './types';

@Injectable()
export class AttioService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + AttioService.name,
    );
    this.registry.registerService('attio', this);
  }

  async addCompany(
    companyData: AttioCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AttioCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/objects/companies/records`,
        JSON.stringify({
          data: companyData,
        }),
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Attio company created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Attio',
        CrmObject.company,
        ActionType.POST,
      );
    }
  }

  async syncCompanies(
    linkedUserId: string,
  ): Promise<ApiResponse<AttioCompanyOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/objects/companies/records/query`,
        {},
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
        message: 'Attio companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Attio',
        CrmObject.company,
        ActionType.POST,
      );
    }
  }
}
