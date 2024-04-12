import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@utils/@types';
import {
  HubspotNoteInput,
  HubspotNoteOutput,
  commonNoteHubspotProperties,
} from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class HubspotService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addNote(
    noteData: HubspotNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: noteData,
      };
      const resp = await axios.post(
        `${connection.account_url}/objects/notes`,
        JSON.stringify(dataBody),
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
        message: 'Hubspot note created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.note,
        ActionType.POST,
      );
    }
  }

  async syncNotes(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotNoteOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonNoteHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = '${connection.account_url}/objects/notes';

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot notes !`);

      return {
        data: resp.data.results,
        message: 'Hubspot notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.note,
        ActionType.GET,
      );
    }
  }
}
