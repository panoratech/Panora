import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { JiraTicketInput, JiraTicketOutput } from './types';

@Injectable()
export class JiraService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
  }

  async addTicket(
    ticketData: JiraTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<JiraTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/issue`,
        JSON.stringify(ticketData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // todo: Add comment if someone wants to add one when creation of the ticket

      // Process attachments
      let uploads = [];
      const uuids = ticketData.attachments;
      if (uuids && uuids.length > 0) {
        uploads = await Promise.all(
          uuids.map(async (uuid) => {
            const attachment = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!attachment) {
              throw new ReferenceError(
                `tcg_attachment not found for uuid ${uuid}`,
              );
            }
            // TODO: Construct the right binary attachment
            // Get the AWS S3 right file
            // TODO: Check how to send a stream of a URL
            return attachment.file_url; //await this.utils.fetchFileStreamFromURL(attachment.file_url);
          }),
        );
      }

      if (uploads.length > 0) {
        const formData = new FormData();

        uploads.forEach((fileStream, index) => {
          //const stats = fs.statSync(fileStream);
          //const fileSizeInBytes = stats.size;
          formData.append('file', fileStream); //, { knownLength: fileSizeInBytes });
        });

        // Send request with attachments
        const resp_ = await axios.post(
          `${connection.account_url}/issue/${resp.data.id}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Atlassian-Token': 'no-check',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      }

      return {
        data: resp.data,
        message: 'Jira ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'jira',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<JiraTicketOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });
      const resp = await axios.get(`${connection.account_url}/search`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced jira tickets !`);

      return {
        data: resp.data.issues,
        message: 'Jira tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'jira',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
