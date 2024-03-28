/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@utils/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { FreshsalesCompanyInput, FreshsalesCompanyOutput } from './types';

@Injectable()
export class FreshsalesService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async addCompany(
    companyData: FreshsalesCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const dataBody = {
        company: companyData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/companys',
        JSON.stringify(dataBody),
        {
          headers: {
            Authorization: `Token token=${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales company created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.company,
        ActionType.POST,
      );
    }
  }

  async syncCompanies(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesCompanyOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(
        `https://domain.freshsales.io/api/companys`,
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
        data: resp.data,
        message: 'Freshsales companys retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.company,
        ActionType.GET,
      );
    }
  }
}
