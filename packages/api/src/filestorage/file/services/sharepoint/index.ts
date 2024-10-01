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
import { SharepointFileOutput } from './types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

@Injectable()
export class SharepointService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private fieldMappingService: FieldMappingService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<SharepointFileOutput[]>> {
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

      const allFiles: SharepointFileOutput[] = [];

      for (const folderId of foldersToSync) {
        const files = await this.syncFolder(connection, folderId, linkedUserId);
        allFiles.push(...files);
      }

      this.logger.log(
        `Synced SharePoint files from root and specified folder!`,
      );
      return {
        data: allFiles,
        message: 'SharePoint files retrieved from root and specified folder',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing SharePoint files: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private async syncFolder(
    connection: any,
    folderId: string,
    linkedUserId: string,
  ): Promise<SharepointFileOutput[]> {
    const customFields = await this.fieldMappingService.getCustomFieldMappings(
      'sharepoint',
      linkedUserId,
      'filestorage.file',
    );

    const selectFields = [
      'id',
      'name',
      'webUrl',
      'createdDateTime',
      'lastModifiedDateTime',
      'size',
      'file',
      'folder',
      'permissions',
      '@microsoft.graph.downloadUrl',
    ];

    if (customFields) {
      customFields.forEach((field) => {
        selectFields.push(`fields/${field.remote_id}`);
      });
    }

    const resp = await axios.get(
      `${connection.account_url}/drive/items/${folderId}/children`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
        params: {
          $select: selectFields.join(','),
          $expand: 'fields',
        },
      },
    );

    const files: SharepointFileOutput[] = resp.data.value.filter(
      (elem) => !elem.folder,
    );

    // Add permissions (shared link is also included in permissions in SharePoint)
    await Promise.all(
      files.map(async (driveItem) => {
        const resp = await axios.get(
          `${connection.account_url}/drive/items/${driveItem.id}/permissions`,
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
      `${connection.account_url}/drive/items/${fileId}/content`,
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
