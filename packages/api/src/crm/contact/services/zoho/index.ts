import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@utils/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { ZohoContactInput, ZohoContactOutput } from './types';

@Injectable()
export class ZohoService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + ZohoService.name,
    );
    this.registry.registerService('zoho', this);
  }

  async addContact(
    contactData: ZohoContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/Contacts`,
        { data: [contactData] },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //this.logger.log('zoho resp is ' + JSON.stringify(resp));
      return {
        data: resp.data.data,
        message: 'Zoho contact created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.contact,
        ActionType.POST,
      );
    }
    return;
  }

  async syncContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoContactOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      //TODO: handle fields
      const fields = 'First_Name,Last_Name,Full_Name,Email,Phone';
      const resp = await axios.get(
        `${connection.account_url}/Contacts?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //this.logger.log('CONTACTS ZOHO ' + JSON.stringify(resp.data.data));
      this.logger.log(`Synced zoho contacts !`);
      return {
        data: resp.data.data,
        message: 'Zoho contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
