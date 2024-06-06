import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@lib/@types';
import { CloseNoteInput, CloseNoteOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
<<<<<<< HEAD
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
=======
import { ActionType, handleServiceError } from '@@core/utils/errors';
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class CloseService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }
  async addNote(
    noteData: CloseNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/activity/note`,
        JSON.stringify(noteData),
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
        message: 'Close note created',
        statusCode: 201,
      };
    } catch (error) {
<<<<<<< HEAD
      handle3rdPartyServiceError(
=======
      handleServiceError(
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
        error,
        this.logger,
        'Close',
        CrmObject.note,
        ActionType.POST,
      );
    }
  }

  async syncNotes(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseNoteOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/activity/note`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close notes !`);
      return {
        data: resp?.data?.data,
        message: 'Close notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
<<<<<<< HEAD
      handle3rdPartyServiceError(
=======
      handleServiceError(
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
        error,
        this.logger,
        'Close',
        CrmObject.note,
        ActionType.GET,
      );
    }
  }
}
