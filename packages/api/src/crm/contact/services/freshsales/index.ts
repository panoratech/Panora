/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  CrmObject,
  FreshsalesContactInput,
  FreshsalesContactOutput,
} from '@crm/@utils/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { IContactService } from '@crm/contact/types';

@Injectable()
export class FreshSalesService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
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
          id_linked_user: linkedUserId,
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
            Authorization: `Token token=${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
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

  async syncContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesContactOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(
        `https://domain.freshsales.io/api/contacts`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
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
