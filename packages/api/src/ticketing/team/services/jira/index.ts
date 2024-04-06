import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITeamService } from '@ticketing/team/types';
import { JiraTeamOutput } from './types';

@Injectable()
export class JiraService implements ITeamService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.team.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
  }

  async syncTeams(
    linkedUserId: string,
  ): Promise<ApiResponse<JiraTeamOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing'
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/rest/api/3/user/groups`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced jira teams !`);

      return {
        data: resp.data._results,
        message: 'Jira teams retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Jira',
        TicketingObject.team,
        ActionType.GET,
      );
    }
  }
}
