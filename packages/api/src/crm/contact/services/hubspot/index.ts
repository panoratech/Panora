import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@@core/utils/types';
import {
  CrmObject,
  HubspotContactInput,
  HubspotContactOutput,
  commonHubspotProperties,
} from 'src/crm/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Injectable()
export class HubspotService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + HubspotService.name,
    );
  }
  async addContact(
    contactData: HubspotContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });
      const dataBody = {
        properties: contactData,
      };
      const resp = await axios.post(
        `https://api.hubapi.com/crm/v3/objects/contacts/`,
        JSON.stringify(dataBody),
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
        message: 'Hubspot contact created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.contact,
        ActionType.POST,
      );
    }
    return;
  }

  async syncContacts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });

      const commonPropertyNames = Object.keys(commonHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = 'https://api.hubapi.com/crm/v3/objects/contacts/';

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot contacts !`);

      return {
        data: resp.data.results,
        message: 'Hubspot contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
