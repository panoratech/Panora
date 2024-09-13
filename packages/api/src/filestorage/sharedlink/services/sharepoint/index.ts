import { Injectable } from '@nestjs/common';
import { ISharedLinkService } from '@filestorage/sharedlink/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';
import { SharepointSharedLinkInput, SharepointSharedLinkOutput } from './types';

@Injectable()
export class SharepointService implements ISharedLinkService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.sharedlink.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SharepointSharedLinkOutput[]>> {
    try {
      const { linkedUserId, extra } = data;
      //  TODO: where it comes from ??  extra?: { object_name: 'folder' | 'file'; value: string },

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });
      let remote_id;
      if (extra.object_name == 'folder') {
        const a = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: extra.value,
          },
        });
        remote_id = a.remote_id;
      }
      if (extra.object_name == 'file') {
        const a = await this.prisma.fs_files.findUnique({
          where: {
            id_fs_file: extra.value,
          },
        });
        remote_id = a.remote_id;
      }

      const resp = await axios.get(
        `${connection.account_url}/drive/items/${remote_id}/permissions`,
        // Same url as sharepoint permissions
        // We might use POST /drives/{driveId}/items/{itemId}/createLink later
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data,
        message: 'Sharepoint sharedlinks retrieved',
        statusCode: resp.status, // 200 || 201
      };
    } catch (error) {
      throw error;
    }
  }
}
