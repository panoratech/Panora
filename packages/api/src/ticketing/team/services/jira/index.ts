import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
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
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/user/groups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced jira teams !`);

      return {
        data: resp.data._results,
        message: 'Jira teams retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'jira',
        TicketingObject.team,
        ActionType.GET,
      );
    }
  }
}
