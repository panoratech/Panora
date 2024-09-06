import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingAttachmentInput,
  UnifiedAccountingAttachmentOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AttachmentService.name);
  }

  async addAttachment(
    unifiedAttachmentData: UnifiedAccountingAttachmentInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingAttachmentOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addAttachment(
        unifiedAttachmentData,
        linkedUserId,
      );

      const savedAttachment = await this.prisma.acc_attachments.create({
        data: {
          id_acc_attachment: uuidv4(),
          ...unifiedAttachmentData,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      const result: UnifiedAccountingAttachmentOutput = {
        ...savedAttachment,
        id: savedAttachment.id_acc_attachment,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAttachment(
    id_acc_attachment: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingAttachmentOutput> {
    try {
      const attachment = await this.prisma.acc_attachments.findUnique({
        where: { id_acc_attachment: id_acc_attachment },
      });

      if (!attachment) {
        throw new Error(`Attachment with ID ${id_acc_attachment} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: attachment.id_acc_attachment },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedAttachment: UnifiedAccountingAttachmentOutput = {
        id: attachment.id_acc_attachment,
        file_name: attachment.file_name,
        file_url: attachment.file_url,
        account_id: attachment.id_acc_account,
        field_mappings: field_mappings,
        remote_id: attachment.remote_id,
        created_at: attachment.created_at,
        modified_at: attachment.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: attachment.id_acc_attachment },
        });
        unifiedAttachment.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.attachment.pull',
          method: 'GET',
          url: '/accounting/attachment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedAttachment;
    } catch (error) {
      throw error;
    }
  }

  async getAttachments(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingAttachmentOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const attachments = await this.prisma.acc_attachments.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_attachment: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = attachments.length > limit;
      if (hasNextPage) attachments.pop();

      const unifiedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: attachment.id_acc_attachment },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedAttachment: UnifiedAccountingAttachmentOutput = {
            id: attachment.id_acc_attachment,
            file_name: attachment.file_name,
            file_url: attachment.file_url,
            account_id: attachment.id_acc_account,
            field_mappings: field_mappings,
            remote_id: attachment.remote_id,
            created_at: attachment.created_at,
            modified_at: attachment.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: attachment.id_acc_attachment },
            });
            unifiedAttachment.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedAttachment;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.attachment.pull',
          method: 'GET',
          url: '/accounting/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedAttachments,
        next_cursor: hasNextPage
          ? attachments[attachments.length - 1].id_acc_attachment
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
