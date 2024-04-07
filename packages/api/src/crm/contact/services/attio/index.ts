import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AttioContactInput, AttioContactOutput } from './types';

@Injectable()
export class AttioService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + AttioService.name,
    );
    this.registry.registerService('attio', this);
  }

  async addContact(
    contactData: AttioContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AttioContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `https://api.attio.com/v2/objects/people/records`,
        JSON.stringify({
          data: contactData,
        }),
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
        data: resp.data.data,
        message: 'attio contact created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Attio',
        CrmObject.contact,
        ActionType.POST,
      );
    }
    return;
  }

  async syncContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<AttioContactOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });
      // console.log('Before Axios');
      // console.log(this.cryptoService.decrypt(connection.access_token));

      const resp = await axios.post(
        `https://api.attio.com/v2/objects/people/records/query`,
        {},
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      console.log('After Axios');

      return {
        data: resp.data.data,
        message: 'Attio contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Attio',
        CrmObject.contact,
        ActionType.POST,
      );
    }
  }
}
