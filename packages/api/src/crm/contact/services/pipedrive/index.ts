import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import {
  CrmObject,
  PipedriveContactInput,
  PipedriveContactOutput,
} from 'src/crm/@types';
import axios from 'axios';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';
import { handleServiceError } from 'src/@core/utils/errors';

@Injectable()
export class PipedriveService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(PipedriveService.name);
  }

  async addContact(
    contactData: PipedriveContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveContactOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/persons`,
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
        message: 'Pipedrive contact created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(error, this.logger, 'Pipedrive', CrmObject.contact);
    }
    return;
  }
}
