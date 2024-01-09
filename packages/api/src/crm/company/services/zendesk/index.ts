import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import {
  CrmObject,
  ZendeskCompanyInput,
  ZendeskCompanyOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  //TODO: CANT ADD A COMPANY WITH ZENDESK
  async addCompany(
    companyData: ZendeskCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskCompanyOutput>> {
    try {
      //TODO: check required scope  => crm.objects.companys.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/accounts/self`,
        {
          data: companyData,
        },
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
        message: 'Zendesk company created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.company,
        ActionType.POST,
      );
    }
    return;
  }

  async syncCompanies(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskCompanyOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.companys.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/accounts/self`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk companys !`);

      return {
        data: finalData,
        message: 'Zendesk companys retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.company,
        ActionType.GET,
      );
    }
  }
}
