import { Injectable } from '@nestjs/common';
import { IFolderService } from '@filestorage/folder/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { OnedriveFolderInput, OnedriveFolderOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { OnedriveFileOutput } from '@filestorage/file/services/onedrive/types';

@Injectable()
export class OnedriveService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  async addFolder(
    folderData: OnedriveFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<OnedriveFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      // Currently adding in root folder, might need to change
      const resp = await axios.post(
        `${connection.account_url}/v1.0/drive/root/children`,
        JSON.stringify({
          name: folderData.name,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename', // 'rename' | 'fail' | 'replace'
        }),
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
        message: 'Onedrive folder created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async iterativeGetOnedriveFolders(
    remote_folder_id: string,
    linkedUserId: string,
  ): Promise<OnedriveFolderOutput[]> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      let result = [],
        depth = 0,
        batch = [remote_folder_id];

      while (batch.length > 0) {
        if (depth > 5) {
          // todo: handle this better
          break;
        }

        const nestedFolders = await Promise.all(
          batch.map(async (folder_id) => {
            const resp = await axios.get(
              `${connection.account_url}/v1.0/me/drive/items/${folder_id}/children`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`,
                },
              },
            );

            // Add permissions (shared link is also included in permissions in one-drive)
            await Promise.all(
              resp.data.value.map(async (driveItem) => {
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
            const folders = resp.data.value.filter(
              (driveItem) => driveItem.folder,
            );

            // const files = resp.data.value.filter(
            //   (driveItem) => !driveItem.folder,
            // );

            // await this.ingestService.ingestData<
            //   UnifiedFilestorageFileOutput,
            //   OnedriveFileOutput
            // >(
            //   files,
            //   'onedrive',
            //   connection.id_connection,
            //   'filestorage',
            //   FileStorageObject.file,
            // );

            return folders;
          }),
        );

        // nestedFolders = [[subfolder1, subfolder2], [subfolder3, subfolder4]]
        result = result.concat(nestedFolders.flat());
        batch = nestedFolders.flat().map((folder) => folder.id);
        this.logger.log(`Batch size: ${batch.length} at depth ${depth}`);
        depth++;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveFolderOutput[]>> {
    try {
      this.logger.log('Syncing onedrive folders');
      const { linkedUserId } = data;

      const folders = await this.iterativeGetOnedriveFolders(
        'root',
        linkedUserId,
      );

      this.logger.log(`${folders.length} onedrive folders found`);
      this.logger.log(`Synced onedrive folders !`);

      return {
        data: folders,
        message: 'Onedrive folders synced',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.log('Error in onedrive sync ');
      throw error;
    }
  }
}
