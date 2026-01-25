import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedTicketingAttachmentInput,
  UnifiedTicketingAttachmentOutput,
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

  async addAttachment(
    unifiedAttachmentData: UnifiedTicketingAttachmentInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingAttachmentOutput> {
    this.logger.log('addAttachment method called');
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: { id_linked_user: linkedUserId },
      });
      if (!linkedUser) {
        this.logger.error('Linked User Not Found');
        throw new ReferenceError('Linked User Not Found');
      }

      const existingAttachment = await this.prisma.tcg_attachments.findFirst({
        where: { file_name: unifiedAttachmentData.file_name, id_connection: connection_id },
      });

      let unique_ticketing_attachment_id: string;

      if (existingAttachment) {
        this.logger.log('Updating existing attachment');
        const res = await this.prisma.tcg_attachments.update({
          where: { id_tcg_attachment: existingAttachment.id_tcg_attachment },
          data: {
            file_name: unifiedAttachmentData.file_name,
            uploader: linkedUserId,
            modified_at: new Date(),
          },
        });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      } else {
        this.logger.log('Creating new attachment');
        const data = {
          id_tcg_attachment: uuidv4(),
          file_name: unifiedAttachmentData.file_name,
          uploader: linkedUserId,
          created_at: new Date(),
          modified_at: new Date(),
          id_connection: connection_id,
        };

        const res = await this.prisma.tcg_attachments.create({ data });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      }

      const result_attachment = await this.getAttachment(
        unique_ticketing_attachment_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.attachment.push',
          method: 'POST',
          url: '/ticketing/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_attachment,
        'ticketing.attachment.created',
        linkedUser.id_project,
        event.id_event,
      );

      this.logger.log('Attachment successfully added');
      return result_attachment;
    } catch (error) {
      this.logger.error('Error in addAttachment', error.stack);
      throw error;
    }
  }

  async getAttachment(
    id_ticketing_attachment: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingAttachmentOutput> {
    this.logger.log('getAttachment method called');
    try {
      const attachment = await this.prisma.tcg_attachments.findUnique({
        where: { id_tcg_attachment: id_ticketing_attachment },
      });

      if (!attachment) {
        this.logger.error('Attachment not found');
        throw new ReferenceError('Attachment not found');
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: attachment.id_tcg_attachment },
        },
        include: { attribute: true },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Object.fromEntries(fieldMappingsMap);

      let unifiedAttachment: UnifiedTicketingAttachmentOutput = {
        id: attachment.id_tcg_attachment,
        file_name: attachment.file_name,
        file_url: attachment.file_url,
        uploader: attachment.uploader,
        field_mappings,
        remote_id: attachment.remote_id,
        created_at: attachment.created_at,
        modified_at: attachment.modified_at,
      };

      if (attachment.id_tcg_comment) {
        unifiedAttachment.comment_id = attachment.id_tcg_comment;
      }

      if (attachment.id_tcg_ticket) {
        unifiedAttachment.ticket_id = attachment.id_tcg_ticket;
      }

      let res: UnifiedTicketingAttachmentOutput = unifiedAttachment;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: attachment.id_tcg_attachment },
        });
        const remoteData = JSON.parse(resp.data);
        res = { ...res, remote_data: remoteData };
      }

      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connection_id,
            id_project: project_id,
            id_event: uuidv4(),
            status: 'success',
            type: 'ticketing.attachment.pull',
            method: 'GET',
            url: '/ticketing/attachment',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }

      this.logger.log('Attachment successfully retrieved');
      return res;
    } catch (error) {
      this.logger.error('Error in getAttachment', error.stack);
      throw error;
    }
  }

  async getAttachments(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTicketingAttachmentOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    this.logger.log('getAttachments method called');
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_attachments.findFirst({
          where: { id_connection: connection_id, id_tcg_attachment: cursor },
        });
        if (!isCursorPresent) {
          this.logger.error('Invalid cursor provided');
          throw new ReferenceError('The provided cursor does not exist!');
        }
      }

      const attachments = await this.prisma.tcg_attachments.findMany({
        take: limit + 1,
        cursor: cursor ? { id_tcg_attachment: cursor } : undefined,
        orderBy: { created_at: 'asc' },
        where: { id_connection: connection_id },
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

      const unifiedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: attachment.id_tcg_attachment },
            },
            include: { attribute: true },
          });

          const fieldMappingsMap = new Map();
          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          const field_mappings = Object.fromEntries(fieldMappingsMap);

          let unifiedAttachment: UnifiedTicketingAttachmentOutput = {
            id: attachment.id_tcg_attachment,
            file_name: attachment.file_name,
            file_url: attachment.file_url,
            uploader: attachment.uploader,
            field_mappings,
            remote_id: attachment.remote_id,
            created_at: attachment.created_at,
            modified_at: attachment.modified_at,
          };

          if (attachment.id_tcg_comment) {
            unifiedAttachment.comment_id = attachment.id_tcg_comment;
          }

          if (attachment.id_tcg_ticket) {
            unifiedAttachment.ticket_id = attachment.id_tcg_ticket;
          }

          return unifiedAttachment;
        }),
      );

      let res: UnifiedTicketingAttachmentOutput[] = unifiedAttachments;

      if (remote_data) {
        const remote_array_data: UnifiedTicketingAttachmentOutput[] =
          await Promise.all(
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

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
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

      this.logger.log('Attachments successfully retrieved');
      return {
        data: unifiedAttachments,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      this.logger.error('Error in getAttachments', error.stack);
      throw error;
    }
  }

  async downloadAttachment(
    id_ticketing_attachment: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingAttachmentOutput> {
    this.logger.log('downloadAttachment method called');
    // TODO: Implementation pending
    return;
  }
}
