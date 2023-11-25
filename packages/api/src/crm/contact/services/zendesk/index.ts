import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import {
  CrmObject,
  ZendeskContactInput,
  ZendeskContactOutput,
} from 'src/crm/@types';
import axios from 'axios';
import { LoggerService } from 'src/@core/logger/logger.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { ActionType, handleServiceError } from 'src/@core/utils/errors';
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
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/contacts`,
        JSON.stringify(contactData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.access_token}`,
          },
        },
      );
      return {
        data: resp.data,
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
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${connection.access_token}`,
        },
      });
      return {
        data: resp.data,
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
