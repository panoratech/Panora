import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@contact/types';
import {
  CrmObject,
  HubspotContactInput,
  HubspotContactOutput,
} from 'src/crm/@types';
import axios from 'axios';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';
import { ActionType, handleServiceError } from 'src/@core/utils/errors';

@Injectable()
export class HubspotService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
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
            Authorization: `Bearer ${connection.access_token}`,
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
  async getContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/contacts/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.access_token}`,
          },
        },
      );
      return {
        data: resp.data,
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
