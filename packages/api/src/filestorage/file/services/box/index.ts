import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { BoxFileOutput } from './types';

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
        `${connection.account_url}/2.0/folders/${folder.remote_id}/items`,
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

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    const response = await axios.get(
      `${connection.account_url}/2.0/files/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
        responseType: 'arraybuffer',
      },
    );
    return Buffer.from(response.data);
  }
}
