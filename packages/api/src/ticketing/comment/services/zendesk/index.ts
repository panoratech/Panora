import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ZendeskCommentOutput } from './types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class ZendeskCommentService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + ZendeskCommentService.name,
    );
  }
  async addComment(
    commentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskCommentOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
        },
      });
      const dataBody = {
        comment: commentData,
      };
      const ticketOriginalId = 0; //TODO: check if it exists first and retrieve it properly
      const resp = await axios.post(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets/${ticketOriginalId}.json`,
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
        message: 'Zendesk comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  syncComments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCommentOutput[]>> {
    throw new Error('Method not implemented.');
  }
}
