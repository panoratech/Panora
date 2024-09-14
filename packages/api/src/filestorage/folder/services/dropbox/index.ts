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
import { SyncParam } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { DropboxFolderInput, DropboxFolderOutput } from './types';
import { BoxFolderOutput } from '../box/types';
// import { BoxFileOutput } from '@filestorage/file/services/box/types';

@Injectable()
export class DropboxService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${DropboxService.name}`,
    );
    this.registry.registerService('dropbox', this);
  }

  async addFolder(
    folderData: DropboxFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<DropboxFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dropbox',
          vertical: 'filestorage',
        },
      });
      // ref: https://www.dropbox.com/developers/documentation/http/documentation#files-create_folder
      const resp = await axios.post(
        `${connection.account_url}/files/create_folder_v2`,
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
        message: 'Dropbox folder created',
        statusCode: 201,
      };
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }

  async getAllFolders(connection: any): Promise<DropboxFolderOutput[]> {
    // ref: https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder
    const folders: DropboxFolderOutput[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = cursor
        ? `${connection.account_url}/files/list_folder/continue`
        : `${connection.account_url}/files/list_folder`;
      const data = cursor ? { cursor } : { path: '', recursive: true };

      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
          'Content-Type': 'application/json',
        },
      });

      const { entries, has_more, cursor: newCursor } = response.data;

      // Collect all folder entries
      folders.push(
        ...entries.filter((entry: any) => entry['.tag'] === 'folder'),
      );

      hasMore = has_more;
      cursor = newCursor;
    }

    return folders;
  }

  async sync(data: SyncParam): Promise<ApiResponse<BoxFolderOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dropbox',
          vertical: 'filestorage',
        },
      });

      const results = await this.getAllFolders(connection);
      this.logger.log(`Synced dropbox folders !`);

      return {
        data: results,
        message: 'Dropbox folders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }
}
