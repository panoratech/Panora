import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import { ZendeskContactInput, ZendeskContactOutput } from 'src/crm/@types';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { LoggerService } from 'src/@core/logger/logger.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';
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
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        //console.error('Error with Axios request:', error.response?.data);
        this.logger.error('Error with Axios request:', error.response?.data);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        //console.error('Error with Prisma request:', error);
        this.logger.error('Error with Prisma request:', error.message);
      }
      this.logger.error(
        'An error occurred...',
        error.response?.data || error.message,
      );
    }
    return;
  }
}
