import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@utils/@types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../registry.service';
import { GithubCommentInput, GithubCommentOutput } from './types';

@Injectable()
export class GithubService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + GithubService.name,
    );
    this.registry.registerService('github', this);
  }
  async addComment(
    commentData: GithubCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<GithubCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
          vertical: 'ticketing'
        },
      });
      const dataBody = {
        comment: commentData,
      };
      const resp = await axios.post(
        `https://api2.frontapp.com/conversations/${remoteIdTicket}/comments`,
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
        message: 'Github comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<OriginalCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
          vertical: 'ticketing'
        },
      });
      //retrieve ticket remote id so we can retrieve the comments in the original software
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `https://api2.frontapp.com/conversations/${ticket.remote_id}/comments`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced github comments !`);

      return {
        data: resp.data._results,
        message: 'Front github retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
