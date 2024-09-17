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
import { DropboxFileOutput } from './types';

@Injectable()
export class DropboxService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.file.toUpperCase() + ':' + DropboxService.name,
    );
    this.registry.registerService('dropbox', this);
  }

  async getAllFilesInFolder(
    folderPath: string,
    connection: any,
  ): Promise<DropboxFileOutput[]> {
    // ref: https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder
    const files: DropboxFileOutput[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = cursor
        ? `${connection.account_url}/files/list_folder/continue`
        : `${connection.account_url}/files/list_folder`;

      const data = cursor ? { cursor } : { path: folderPath, recursive: false };

      try {
        const response = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        });

        const { entries, has_more, cursor: newCursor } = response.data;

        // Collect all file entries
        files.push(...entries.filter((entry: any) => entry['.tag'] === 'file'));

        hasMore = has_more;
        cursor = newCursor;
      } catch (error) {
        console.error('Error listing files in folder:', error);
        throw new Error('Failed to list all files in the folder.');
      }
    }

    return files;
  }

  async sync(data: SyncParam): Promise<ApiResponse<DropboxFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;
      if (!id_folder) return;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dropbox',
          vertical: 'filestorage',
        },
      });

      const folder = await this.prisma.fs_folders.findUnique({
        where: {
          id_fs_folder: id_folder as string,
        },
      });

      const remote_data = await this.prisma.remote_data.findFirst({
        where: {
          ressource_owner_id: folder.id_fs_folder,
        },
      });

      const folder_remote_data = JSON.parse(remote_data.data);

      const files = await this.getAllFilesInFolder(
        folder_remote_data.path_display,
        connection,
      );

      this.logger.log(`Synced dropbox files !`);

      return {
        data: files,
        message: 'Dropbox files retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    const response = await axios.get(
      `${connection.account_url}/files/download`,
      {
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
          'Dropbox-API-Arg': JSON.stringify({ path: fileId }),
        },
        responseType: 'arraybuffer',
      },
    );
    return Buffer.from(response.data);
  }
}
