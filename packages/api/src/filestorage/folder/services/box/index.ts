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
import { BoxFolderInput, BoxFolderOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BoxFileOutput } from '@filestorage/file/services/box/types';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';

@Injectable()
export class BoxService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      FileStorageObject.folder.toUpperCase() + ':' + BoxService.name,
    );
    this.registry.registerService('box', this);
  }

  async addFolder(
    folderData: BoxFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<BoxFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/2.0/folders`,
        JSON.stringify(folderData),
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
        data: resp?.data,
        message: 'Box folder created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async recursiveGetBoxFolders(
    remote_folder_id: string,
    linkedUserId: string,
  ): Promise<BoxFolderOutput[]> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });
      const resp = await axios.get(
        `${connection.account_url}/2.0/folders/${remote_folder_id}/items`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const folders = resp.data.entries.filter((elem) => elem.type == 'folder');
      const files = resp.data.entries.filter((elem) => elem.type == 'file');
      await this.ingestService.ingestData<UnifiedFilestorageFileOutput, BoxFileOutput>(
        files,
        'box',
        connection.id_connection,
        'filestorage',
        FileStorageObject.file,
      );

      let results: BoxFolderOutput[] = folders;
      for (const folder of folders) {
        // Recursively get subfolders
        const subFolders = await this.recursiveGetBoxFolders(
          folder.id,
          linkedUserId,
        );
        results = results.concat(subFolders);
      }
      return results;
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<BoxFolderOutput[]>> {
    try {
      const { linkedUserId } = data;
      // to sync all folders we start from root folder ("0") and recurse through it
      const results = await this.recursiveGetBoxFolders('0', linkedUserId);
      this.logger.log(`Synced box folders !`);

      return {
        data: results,
        message: 'Box folders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
