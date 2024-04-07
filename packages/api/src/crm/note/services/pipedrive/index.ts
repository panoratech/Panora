import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@utils/@types';
import { PipedriveNoteInput, PipedriveNoteOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addNote(
    noteData: PipedriveNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/notes`,
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
        data: resp.data.data,
        message: 'Pipedrive note created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.note,
        ActionType.POST,
      );
    }
    return;
  }

  async syncNotes(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveNoteOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/notes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.note,
        ActionType.GET,
      );
    }
  }
}
