import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { FrontTicketInput, FrontTicketOutput } from './types';
import { Utils } from '@ticketing/@lib/@utils';
import { SyncParam } from '@@core/utils/types/interface';
import * as FormData from 'form-data';

@Injectable()
export class FrontService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async addTicket(
    ticketData: FrontTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FrontTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      //We deconstruct as tags must be added separately
      const { tags, custom_fields, ...restOfTicketData } = ticketData;

      let uploads = [];
      const uuids = restOfTicketData.comment.attachments;
      if (uuids && uuids.length > 0) {
        for (const uuid of uuids) {
          const res = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: uuid,
            },
          });
          if (!res)
            throw new ReferenceError(
              `tcg_attachment not found for uuid ${uuid}`,
            );
          //TODO: construct the right binary attachment
          //get the AWS s3 right file
          //TODO: check how to send a stream of a url
          const fileStream = await this.utils.fetchFileStreamFromURL(
            res.file_url,
          );

          uploads = [...uploads, fileStream];
        }
      }

      let resp;
      if (uploads.length > 0) {
        const dataBody = {
          ...restOfTicketData,
          comment: { ...restOfTicketData.comment },
        };
        const formData = new FormData();

        formData.append('type', dataBody.type);

        if (dataBody.inbox_id) {
          formData.append('inbox_id', dataBody.inbox_id);
        }
        if (dataBody.teammate_ids && dataBody.teammate_ids.length > 0) {
          for (let i = 0; i < dataBody.teammate_ids.length; i++) {
            const item = dataBody.teammate_ids[i];
            formData.append(`teammate_ids[${i}]`, item);
          }
        }
        if (dataBody.comment.author_id) {
          formData.append('comment[author_id]', dataBody.comment.author_id);
        }
        formData.append('comment[body]', dataBody.comment.body);

        for (let i = 0; i < uploads.length; i++) {
          const up = uploads[i];
          formData.append(`comment[attachments][${i}]`, up);
        }

        resp = await axios.post(
          `${connection.account_url}/conversations`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      } else {
        resp = await axios.post(
          `${connection.account_url}/conversations`,
          JSON.stringify(restOfTicketData),
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

      //now we can add tags and/or custom fields to the conversation we just created
      if (tags && tags.length > 0) {
        let final: any = {
          tag_ids: tags,
        };
        if (custom_fields) {
          final = { ...final, custom_fields: custom_fields };
        }
        const tag_resp = await axios.patch(
          `${connection.account_url}/conversations/${resp.data.id}`,
          JSON.stringify(final),
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
        message: 'Front ticket created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<FrontTicketOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/conversations`, {
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced front tickets !`);

      return {
        data: resp.data._results,
        message: 'Front tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
