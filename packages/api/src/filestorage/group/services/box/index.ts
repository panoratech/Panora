import { Injectable } from '@nestjs/common';
import { IGroupService } from '@filestorage/group/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { BoxGroupInput, BoxGroupOutput } from './types';

@Injectable()
export class BoxService implements IGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.group.toUpperCase() + ':' + BoxService.name,
    );
    this.registry.registerService('box', this);
  }

  async syncGroups(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<BoxGroupOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });
      const resp = await axios.get(`${connection.account_url}/groups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced box groups !`);

      return {
        data: resp.data.entries,
        message: 'Box groups retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Box',
        FileStorageObject.group,
        ActionType.GET,
      );
    }
  }
}
