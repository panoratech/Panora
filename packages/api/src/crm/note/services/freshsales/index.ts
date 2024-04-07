/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@utils/@types';
import { FreshsalesNoteInput, FreshsalesNoteOutput } from './types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { INoteService } from '@crm/note/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class FreshsalesService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async addNote(
    noteData: FreshsalesNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const dataBody = {
        note: noteData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/notes',
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
        message: 'Freshsales note created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.note,
        ActionType.POST,
      );
    }
  }

  async syncNotes(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesNoteOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://domain.freshsales.io/api/notes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data,
        message: 'Freshsales notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.note,
        ActionType.GET,
      );
    }
  }
}
