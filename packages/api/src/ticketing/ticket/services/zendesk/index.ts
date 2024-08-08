import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ITicketService } from '@ticketing/ticket/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { ZendeskTicketInput, ZendeskTicketOutput } from './types';

@Injectable()
export class ZendeskService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }
  async addTicket(
    ticketData: ZendeskTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
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
              throw new ReferenceError(
                `tcg_attachment not found for uuid ${uuid}`,
              );

            //TODO:; fetch the right file from AWS s3
            const s3File = '';
            const url = `${connection.account_url}/v2/uploads.json?filename=${res.file_name}`;

            const resp = await axios.get(url, {
              headers: {
                'Content-Type': this.utils.getMimeType(res.file_name),
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

      this.logger.log(
        'data to insert for zendesk ticket is ' + JSON.stringify(dataBody),
      );

      const resp = await axios.post(
        `${connection.account_url}/v2/tickets.json`,
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
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskTicketOutput[]>> {
    try {
      const { linkedUserId, webhook_remote_identifier } = data;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });
      const remote_ticket_id = webhook_remote_identifier as string;

      const request_url = remote_ticket_id
        ? `${connection.account_url}/v2/tickets/${remote_ticket_id}.json`
        : `${connection.account_url}/v2/tickets.json`;

      const resp = await axios.get(request_url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk tickets !`);

      const result = remote_ticket_id ? [resp.data.ticket] : resp.data.tickets;

      return {
        data: result,
        message: 'Zendesk tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
