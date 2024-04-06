import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@utils/@types';
import { ZendeskNoteInput, ZendeskNoteOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addNote(
    noteData: ZendeskNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm'
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/notes`,
        {
          data: noteData,
        },
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
        message: 'Zendesk note created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.note,
        ActionType.POST,
      );
    }
    return;
  }

  async syncNotes(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskNoteOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm'
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/notes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk notes !`);

      return {
        data: finalData,
        message: 'Zendesk notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.note,
        ActionType.GET,
      );
    }
  }
}
