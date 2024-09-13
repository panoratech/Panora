import { Injectable } from '@nestjs/common';
import { IPermissionService } from '@filestorage/permission/types';
import { FileStorageObject } from '@panora/shared';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SharepointPermissionInput, SharepointPermissionOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class SharepointService implements IPermissionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.permission.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SharepointPermissionOutput[]>> {
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
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: resp.data.value as SharepointPermissionOutput[],
        message: 'Synced sharepoint permissions !',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
