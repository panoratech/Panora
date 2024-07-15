import { Injectable } from '@nestjs/common';
import { IFileService } from '@filestorage/file/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { BoxFileInput, BoxFileOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class BoxService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.file.toUpperCase() + ':' + BoxService.name,
    );
    this.registry.registerService('box', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<BoxFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;
      if (!id_folder) return;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });

      const folder = await this.prisma.fs_folders.findUnique({
        where: {
          id_fs_folder: id_folder as string,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/folders/${folder.remote_id}/items`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const files: BoxFileOutput[] = resp.data.entries.filter(
        (elem) => elem.type == 'file',
      );
      this.logger.log(`Synced box files !`);

      return {
        data: files,
        message: 'Box files retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
