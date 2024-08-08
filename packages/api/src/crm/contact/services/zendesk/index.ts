import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { ZendeskContactInput, ZendeskContactOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
@Injectable()
export class ZendeskService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addContact(
    contactData: ZendeskContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v2/contacts`,
        {
          data: contactData,
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
        message: 'Zendesk contact created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskContactOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`${connection.account_url}/v2/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const finalData: any[] = resp.data.items.map((item) => {
        return item.data;
      });
      const filteredData = finalData.filter(
        (item) => item.is_organization === false,
      );

      this.logger.log(`Synced zendesk contacts !`);

      return {
        data: filteredData,
        message: 'Zendesk contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
