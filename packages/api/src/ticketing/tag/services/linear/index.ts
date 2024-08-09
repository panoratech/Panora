import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITagService } from '@ticketing/tag/types';
import { LinearTagOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class LinearService implements ITagService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.tag.toUpperCase() + ':' + LinearService.name,
    );
    this.registry.registerService('linear', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<LinearTagOutput[]>> {
    try {
      const { linkedUserId, id_ticket } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'linear',
          vertical: 'ticketing',
        },
      });

      const labelQuery = {
        "query": "query { issueLabels { nodes { id name } }}"
      };

      let resp = await axios.post(
        `${connection.account_url}`,
        labelQuery, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced linear tags !`);

      return {
        data: resp.data.data.issueLabels.nodes,
        message: 'Linear tags retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
