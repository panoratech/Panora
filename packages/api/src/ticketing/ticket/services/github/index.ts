import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { GithubTicketInput, GithubTicketOutput } from './types';
import { CommonTicketService } from '@ticketing/@utils/@services/common';

//TODO
@Injectable()
export class GithubService
  extends CommonTicketService<GithubTicketOutput, GithubTicketInput>
  implements ITicketService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Github', 'github');
  }
  async addTicket(
    ticketData: GithubTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GithubTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
        },
      });
      const dataBody = ticketData;
      const owner = '';
      const repo = '';
      const resp = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        JSON.stringify(dataBody),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data,
        message: 'Github ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }

  protected mapResponse(data: any): GithubTicketOutput[] {
    return data;
  }

  protected constructApiEndpoint(): string {
    return 'https://api.github.com/repos/issues';
  }
}
