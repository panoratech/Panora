import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import {
  CrmObject,
  HubspotContactInput,
  HubspotContactOutput,
} from 'src/crm/@types';
import axios from 'axios';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';
import { handleServiceError } from 'src/@core/utils/errors';

@Injectable()
export class HubspotService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(HubspotService.name);
  }
  async addContact(
    contactData: HubspotContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
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
      handleServiceError(error, this.logger, 'Hubspot', CrmObject.contact);
    }
    return;
  }
}
