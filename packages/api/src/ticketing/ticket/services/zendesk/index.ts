import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  TicketingObject,
  ZendeskTicketInput,
  ZendeskTicketOutput,
} from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { CommonTicketService } from '@ticketing/@utils/@services/common';

@Injectable()
export class ZendeskService
  extends CommonTicketService<ZendeskTicketOutput, ZendeskTicketInput>
  implements ITicketService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    private env: EnvironmentService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Zendesk', 'zendesk_tcg');
  }
  async addTicket(
    ticketData: ZendeskTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_tcg',
        },
      });
      let dataBody = {
        ticket: ticketData,
      };
      // We must fetch tokens from zendesk with the commentData.uploads array of Attachment uuids
      const uuids = ticketData.comment.uploads;
      let uploads = [];
      if (uuids && uuids.length > 0) {
        await Promise.all(
          uuids.map(async (uuid) => {
            const res = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!res)
              throw new Error(`tcg_attachment not found for uuid ${uuid}`);

            //TODO:; fetch the right file from AWS s3
            const s3File = '';
            const url = `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/uploads.json?filename=${
              res.file_name
            }`;

            const resp = await axios.get(url, {
              headers: {
                'Content-Type': 'image/png', //TODO: get the right content-type given a file name extension
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            });
            uploads = [...uploads, resp.data.upload.token];
          }),
        );
        const finalData = {
          ...ticketData,
          comment: {
            ...ticketData.comment,
            uploads: uploads,
          },
        };
        dataBody = {
          ticket: finalData,
        };
      }

      const resp = await axios.post(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets.json`,
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
        data: resp.data.ticket,
        message: 'Zendesk ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }

  protected constructApiEndpoint(): string {
    return `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets.json`;
  }

  protected mapResponse(data: any): ZendeskTicketOutput[] {
    return data.tickets;
  }
}
