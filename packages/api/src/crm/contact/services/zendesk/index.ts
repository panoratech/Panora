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
import { handleServiceError } from 'src/@core/utils/errors';
@Injectable()
export class ZendeskService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ZendeskService.name);
  }

  async addContact(
    contactData: ZendeskContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
        },
      });
      const resp = await axios.post(
        //TODO
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
      handleServiceError(error, this.logger, 'Zendesk', CrmObject.contact);
    }
    return;
  }
}
