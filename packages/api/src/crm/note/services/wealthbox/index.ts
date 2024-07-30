import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@lib/@types';
import { WealthboxNoteInput, WealthboxNoteOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class WealthboxService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + WealthboxService.name,
    );
    this.registry.registerService('wealthbox', this);
  }

  async addNote(
    noteData: WealthboxNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<WealthboxNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'wealthbox',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v1/notes`,
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
        data: resp.data,
        message: 'Wealthbox note created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<WealthboxNoteOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: "wealthobx",
          vertical: "crm"
        }
      })

      const baseUrl = `${connection.account_url}/v1/notes`

      const resp = await axios.get(baseUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      })

      this.logger.log(`Synced Wealthbox notes !`);
      return {
        data: resp?.data?.notes,
        message: 'Wealthbox notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error
    }
  }
}