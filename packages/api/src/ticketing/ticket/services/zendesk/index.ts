import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
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
              throw new Error(`tcg_attachment not found for uuid ${uuid}`);

            //TODO:; fetch the right file from AWS s3
            const s3File = '';
            const url = `${connection.account_url}/uploads.json?filename=${res.file_name}`;

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

      this.logger.log(
        'data to insert for zendesk ticket is ' + JSON.stringify(dataBody),
      );

      const resp = await axios.post(
        `${connection.account_url}/tickets.json`,
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
  async syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/tickets.json`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk tickets !`);

      return {
        data: resp.data.tickets,
        message: 'Zendesk tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
