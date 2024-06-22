import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '../types/model.unified';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
  ) {
    this.logger.setContext(AttachmentService.name);
  }

  async batchAddAttachments(
    unifiedAttachmentData: UnifiedAttachmentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedAttachmentData.map((unifiedData) =>
          this.addAttachment(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throw error;
    }
  }

  async addAttachment(
    unifiedAttachmentData: UnifiedAttachmentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');

      //EXCEPTION: for Attachments we directly store them inside our db (no raw call to the provider)
      //the actual job to retrieve the attachment info would be done inside /comments

      // add the attachment inside our db

      const existingAttachment = await this.prisma.tcg_attachments.findFirst({
        where: {
          file_name: unifiedAttachmentData.file_name,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_ticketing_attachment_id: string;

      if (existingAttachment) {
        // Update the existing attachment
        const res = await this.prisma.tcg_attachments.update({
          where: {
            id_tcg_attachment: existingAttachment.id_tcg_attachment,
          },
          data: {
            file_name: unifiedAttachmentData.file_name,
            uploader: linkedUserId,
            modified_at: new Date(),
          },
        });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      } else {
        // Create a new attachment
        this.logger.log('not existing attachment ');
        const data = {
          id_tcg_attachment: uuidv4(),
          file_name: unifiedAttachmentData.file_name,
          uploader: linkedUserId,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_platform: integrationId,
        };

        const res = await this.prisma.tcg_attachments.create({
          data: data,
        });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      }

      const result_attachment = await this.getAttachment(
        unique_ticketing_attachment_id,
        remote_data,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.attachment.push', //sync, push or pull
          method: 'POST',
          url: '/ticketing/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        result_attachment,
        'ticketing.attachment.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_attachment;
    } catch (error) {
      throw error;
    }
  }

  async getAttachment(
    id_ticketing_attachment: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
    try {
      const attachment = await this.prisma.tcg_attachments.findUnique({
        where: {
          id_tcg_attachment: id_ticketing_attachment,
        },
      });

      // Fetch field mappings for the attachment
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: attachment.id_tcg_attachment,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedAttachmentOutput format
      const unifiedAttachment: UnifiedAttachmentOutput = {
        id: attachment.id_tcg_attachment,
        file_name: attachment.file_name,
        file_url: attachment.file_url,
        uploader: attachment.uploader,
        field_mappings: field_mappings,
      };

      let res: UnifiedAttachmentOutput = unifiedAttachment;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: attachment.id_tcg_attachment,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getAttachments(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAttachmentOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_attachments.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_attachment: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }
      const attachments = await this.prisma.tcg_attachments.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_attachment: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (attachments.length === limit + 1) {
        next_cursor = Buffer.from(
          attachments[attachments.length - 1].id_tcg_attachment,
        ).toString('base64');
        attachments.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedAttachments: UnifiedAttachmentOutput[] = await Promise.all(
        attachments.map(async (attachment) => {
          // Fetch field mappings for the attachment
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: attachment.id_tcg_attachment,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedAttachmentOutput format
          return {
            id: attachment.id_tcg_attachment,
            file_name: attachment.file_name,
            file_url: attachment.file_url,
            uploader: attachment.uploader, //TODO
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedAttachmentOutput[] = unifiedAttachments;

      if (remote_data) {
        const remote_array_data: UnifiedAttachmentOutput[] = await Promise.all(
          res.map(async (attachment) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: attachment.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...attachment, remote_data };
          }),
        );

        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.attachment.pull',
          method: 'GET',
          url: '/ticketing/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }

  //TODO
  async downloadAttachment(
    id_ticketing_attachment: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
    return;
  }
}
