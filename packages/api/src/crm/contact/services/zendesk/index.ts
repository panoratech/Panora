import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@contact/types';
import {
  CrmObject,
  ZendeskContactInput,
  ZendeskContactOutput,
} from 'src/crm/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { decrypt } from '@@core/utils/crypto';
@Injectable()
export class ZendeskService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + ZendeskService.name,
    );
  }

  async addContact(
    contactData: ZendeskContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/contacts`,
        {
          data: contactData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${decrypt(connection.access_token)}`,
          },
        },
      );

      return {
        data: resp.data.data,
        message: 'Zendesk contact created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.contact,
        ActionType.POST,
      );
    }
    return;
  }

  async getContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${decrypt(connection.access_token)}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      return {
        data: finalData,
        message: 'Zendesk contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
