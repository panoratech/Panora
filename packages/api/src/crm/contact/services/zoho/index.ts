import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@contact/types';
import { CrmObject, ZohoContactInput, ZohoContactOutput } from 'src/crm/@types';
import axios from 'axios';
import { LoggerService } from 'src/@core/logger/logger.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { ActionType, handleServiceError } from 'src/@core/utils/errors';

@Injectable()
export class ZohoService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + ZohoService.name,
    );
  }

  async addContact(
    contactData: ZohoContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.post(
        //TODO
        `https://www.zohoapis.com/crm/v3/Contacts`,
        JSON.stringify(contactData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${connection.access_token}`,
          },
        },
      );
      return {
        data: resp.data,
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

  async getContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://www.zohoapis.com/crm/v3/Contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${connection.access_token}`,
        },
      });
      return {
        data: resp.data,
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
