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
import { BoxSharedLinkInput, BoxSharedLinkOutput } from './types';

@Injectable()
export class BoxService implements ISharedLinkService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.sharedlink.toUpperCase() + ':' + BoxService.name,
    );
    this.registry.registerService('box', this);
  }

  async syncSharedLinks(
    linkedUserId: string,
    remote_object_id: string, // folder id or file id
    custom_properties?: string[],
  ): Promise<ApiResponse<BoxSharedLinkOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });
      let type: string;
      const a = await this.prisma.fs_folders.findFirst({
        where: {
          remote_id: remote_object_id,
          id_connection: connection.id_connection,
        },
      });
      if (a) {
        type = 'folders';
      } else {
        type = 'files';
      }
      const resp = await axios.get(
        `${connection.account_url}/${type}/${remote_object_id}?fields=shared_link`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced box sharedlinks !`);

      return {
        data: [resp.data.shared_link],
        message: 'Box sharedlinks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Box',
        FileStorageObject.sharedlink,
        ActionType.GET,
      );
    }
  }
}
