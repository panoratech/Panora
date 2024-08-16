import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { HrisObject } from '@hris/@lib/@types';
import { IGroupService } from '@hris/group/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { DeelGroupOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.hris';

@Injectable()
export class DeelService implements IGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.group.toUpperCase() + ':' + DeelService.name,
    );
    this.registry.registerService('deel', this);
  }
  addGroup(
    groupData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalGroupOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(data: SyncParam): Promise<ApiResponse<DeelGroupOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'deel',
          vertical: 'hris',
        },
      });

      const resp = await axios.get(`${connection.account_url}/rest/v2/teams`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.cryptoService.decrypt(connection.access_token),
        },
      });
      this.logger.log(`Synced deel groups !`);

      return {
        data: resp.data.data,
        message: 'Deel groups retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
