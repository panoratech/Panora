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
      const { connection, id_folder } = data;

      const foldersToSync = ['root'];
      if (id_folder) {
        const folder = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: id_folder as string,
          },
        });
        if (folder && folder.remote_id !== 'root') {
          foldersToSync.push(folder.remote_id);
        }
      }

      const allFiles: OnedriveFileOutput[] = [];

      for (const folderId of foldersToSync) {
        const files = await this.syncFolder(connection, folderId);
        allFiles.push(...files);
      }

      this.logger.log(`Synced OneDrive files from root and specified folder!`);
      return {
        data: allFiles,
        message: "OneDrive's files retrieved from root and specified folder",
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing OneDrive files: ${error.message}`,
        error,
      );
      throw error;
    }
  }
  private async syncFolder(
    connection: any,
    folderId: string,
  ): Promise<OnedriveFileOutput[]> {
    const resp = await axios.get(
      `${connection.account_url}/v1.0/me/drive/items/${folderId}/children`,
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

    // Add permissions (shared link is also included in permissions in OneDrive)
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

    return files;
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
