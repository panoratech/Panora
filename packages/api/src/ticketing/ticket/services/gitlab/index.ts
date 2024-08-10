import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { GitlabTicketInput, GitlabTicketOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GitlabService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
  }
  async addTicket(
    ticketData: GitlabTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GitlabTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });
      const { comment, ...ticketD } = ticketData;
      const DATA = {
        ...ticketD,
      };

      const resp = await axios.post(
        `${connection.account_url}/v4/projects/${ticketData.project_id}/issues`,
        JSON.stringify(DATA),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //insert comment
      if (comment) {
        const resp_ = await axios.post(
          `${connection.account_url}/v4/projects/${ticketData.project_id}/issues/${resp.data.iid}/notes`,
          JSON.stringify(comment),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      }
      return {
        data: resp.data,
        message: 'Gitlab ticket created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<GitlabTicketOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/v4/issues?scope=created_by_me&scope=assigned_to_me`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced gitlab tickets !`);

      return {
        data: resp.data,
        message: 'Gitlab tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
