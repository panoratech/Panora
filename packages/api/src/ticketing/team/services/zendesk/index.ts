import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { ITeamService } from '@ticketing/team/types';
import { ZendeskTeamOutput } from './types';

@Injectable()
export class ZendeskService implements ITeamService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.team.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async syncTeams(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskTeamOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/groups.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zendesk teams !`);

      return {
        data: resp.data.groups,
        message: 'Zendesk teams retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.team,
        ActionType.GET,
      );
    }
  }
}
