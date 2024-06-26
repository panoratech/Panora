import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { CloseContactInput, CloseContactOutput } from './types';

@Injectable()
export class CloseService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }
  async addContact(
    contactData: CloseContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/contact`,
        JSON.stringify(contactData),
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
        data: resp?.data,
        message: 'Close contact created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.contact,
        ActionType.POST,
      );
    }
  }

  async syncContacts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseContactOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/contact`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close contacts !`);

      return {
        data: resp?.data?.data,
        message: 'Close contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
