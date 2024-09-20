import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFolderService } from '@filestorage/folder/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SharepointFolderInput, SharepointFolderOutput } from './types';
@Injectable()
export class SharepointService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async addFolder(
    folderData: SharepointFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SharepointFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      // Currently adding in root folder, might need to change
      const resp = await axios.post(
        `${connection.account_url}/drive/root/children`,
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
        message: 'Sharepoint folder created',
        statusCode: 201,
      };
    } catch (error) {
      console.log(error.response?.data);
      throw error;
    }
  }

  async iterativeGetSharepointFolders(
    remote_folder_id: string,
    linkedUserId: string,
  ): Promise<SharepointFolderOutput[]> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      // get root folder
      const rootFolderData = await axios.get(
        `${connection.account_url}/drive/root`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      let result = [rootFolderData.data],
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
              `${connection.account_url}/drive/items/${folder_id}/children`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`,
                },
              },
            );

            // Add permissions (shared link is also included in permissions in SharePoint)
            // await Promise.all(
            //   resp.data.value.map(async (driveItem) => {
            //     const resp = await axios.get(
            //       `${connection.account_url}/drive/items/${driveItem.id}/permissions`,
            //       {
            //         headers: {
            //           'Content-Type': 'application/json',
            //           Authorization: `Bearer ${this.cryptoService.decrypt(
            //             connection.access_token,
            //           )}`,
            //         },
            //       },
            //     );
            //     driveItem.permissions = resp.data.value;
            //   }),
            // );

            const folders = resp.data.value.filter(
              (driveItem) => driveItem.folder,
            );

            // const files = resp.data.value.filter(
            //   (driveItem) => !driveItem.folder,
            // );

            // await this.ingestService.ingestData<
            //   UnifiedFilestorageFileOutput,
            //   SharepointFileOutput
            // >(
            //   files,
            //   'sharepoint',
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

  async sync(data: SyncParam): Promise<ApiResponse<SharepointFolderOutput[]>> {
    try {
      this.logger.log('Syncing sharepoint folders');
      const { linkedUserId } = data;

      const folders = await this.iterativeGetSharepointFolders(
        'root',
        linkedUserId,
      );

      this.logger.log(`${folders.length} sharepoint folders found`);
      this.logger.log(`Synced sharepoint folders !`);

      return {
        data: folders,
        message: 'Sharepoint folders synced',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.log('Error in sharepoint sync ');
      throw error;
    }
  }
}
