import { Injectable } from '@nestjs/common';
import { IGroupService } from '@filestorage/group/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { BoxGroupInput, BoxGroupOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

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

  async sync(data: SyncParam): Promise<ApiResponse<BoxGroupOutput[]>> {
    try {
      const { linkedUserId } = data;
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
