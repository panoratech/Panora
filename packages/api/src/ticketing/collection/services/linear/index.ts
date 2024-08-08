import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ICollectionService } from '@ticketing/collection/types';
import { LinearCollectionOutput, LinearCollectionInput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class LinearService implements ICollectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.collection.toUpperCase() + ':' + LinearService.name,
    );
    this.registry.registerService('linear', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<LinearCollectionOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'linear',
          vertical: 'ticketing',
        },
      });

      const projectQuery = {
        "query": "query { projects { nodes { id, name, description } }}"
      };

      let resp = await axios.post(
        `${connection.account_url}`,
        projectQuery, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced linear collections !`);

      return {
        data: resp.data.data.projects.nodes,
        message: 'Linear collections retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
