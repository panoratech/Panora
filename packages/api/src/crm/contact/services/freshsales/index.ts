/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import axios, { AxiosResponse } from 'axios';
import {
  FreshsalesContactInput,
  FreshsalesContactOutput,
} from 'src/crm/@types';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';

@Injectable()
export class FreshSalesService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(FreshSalesService.name);
  }

  async addContact(
    contactData: FreshsalesContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
        },
      });
      const dataBody = {
        contact: contactData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/contacts',
        JSON.stringify(dataBody),
        {
          headers: {
            Authorization: `Token token=${connection.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales contact created',
        statusCode: 201,
      };
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      const status: number = error.response
        ? error.response.status
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return {
        data: null,
        error: error.message,
        message: 'Failed to create contact.',
        statusCode: status,
      };
    }
  }
}
