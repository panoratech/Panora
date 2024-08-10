import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { RedtailContactInput, RedtailContactOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class RedtailService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + RedtailService.name,
    );
    this.registry.registerService('redtail', this);
  }

  async addContact(
    contactData: RedtailContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<RedtailContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'redtail',
          vertical: 'crm',
        },
      });

      const authHeader = this.createAuthHeader(connection.api_key, connection.user_key);

      const resp = await axios.post(
        `${connection.account_url}/contacts`,
        JSON.stringify(contactData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Redtail contact created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<RedtailContactOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'redtail',
          vertical: 'crm',
        },
      });

      const authHeader = this.createAuthHeader(connection.api_key, connection.user_key);

      const resp = await axios.get(`${connection.account_url}/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });

      return {
        data: resp.data.data,
        message: 'Redtail contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  private createAuthHeader(apiKey: string, userKey: string): string {
    const credentials = `${apiKey}:${userKey}`;
    return `Userkeyauth ${Buffer.from(credentials).toString('base64')}`;
  }
}
