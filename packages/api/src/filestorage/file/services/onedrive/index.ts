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
import { OnedriveFileOutput } from './types';

@Injectable()
export class OnedriveService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  // todo: add addFile method

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;
      if (!id_folder) return;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      const folder = await this.prisma.fs_folders.findUnique({
        where: {
          id_fs_folder: id_folder as string,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/v1.0/me/drive/items/${folder.remote_id}/children`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      const files: OnedriveFileOutput[] = resp.data.value.filter(
        (elem) => !elem.folder, // files don't have a folder property
      );

      // Add permission shared link is also included in permissions in one-drive)
      await Promise.all(
        files.map(async (driveItem) => {
          const resp = await axios.get(
            `${connection.account_url}/v1.0/me/drive/items/${driveItem.id}/permissions`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            },
          );
          driveItem.permissions = resp.data.value;
        }),
      );

      this.logger.log(`Synced onedrive files !`);
      return {
        data: files,
        message: "One Drive's files retrieved",
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    const response = await axios.get(
      `${connection.account_url}/v1.0/me/drive/items/${fileId}/content`,
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
