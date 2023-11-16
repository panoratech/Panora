/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import axios from 'axios';
import {
  CrmObject,
  FreshsalesContactInput,
  FreshsalesContactOutput,
} from 'src/crm/@types';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';
import { ActionType, handleServiceError } from 'src/@core/utils/errors';

@Injectable()
export class FreshSalesService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + FreshSalesService.name,
    );
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
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.contact,
        ActionType.POST,
      );
    }
  }

  async getContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
        },
      });
      const resp = await axios.get(
        `https://domain.freshsales.io/api/contacts`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.access_token}`,
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
