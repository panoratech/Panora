import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  AttachmentType,
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ats';
import { IAttachmentService } from '../types';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(AttachmentService.name);
  }

  async addAttachment(
    unifiedAttachmentData: UnifiedAttachmentInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.attachment',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedAttachmentInput>({
          sourceObject: unifiedAttachmentData,
          targetType: AtsObject.attachment,
          providerName: integrationId,
          vertical: 'ats',
          customFieldMappings: unifiedAttachmentData.field_mappings
            ? customFieldMappings
            : [],
        });

      const service = this.serviceRegistry.getService(
        integrationId,
      ) as IAttachmentService;
      const resp: ApiResponse<OriginalAttachmentOutput> =
        await service.addAttachment(
          desunifiedObject,
          linkedUserId,
          unifiedAttachmentData.attachment_type,
        );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: [resp.data],
        targetType: AtsObject.attachment,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedAttachmentOutput[];

      const source_attachment = resp.data;
      const target_attachment = unifiedObject[0];

      const unique_ats_attachment_id = await this.saveOrUpdateAttachment(
        target_attachment,
        connection_id,
      );

      if (target_attachment.candidate_id) {
        await this.prisma.ats_candidate_attachments.update({
          where: {
            id_ats_candidate_attachment: unique_ats_attachment_id,
          },
          data: {
            id_ats_candidate: target_attachment.candidate_id,
          },
        });
      }

      await this.ingestService.processFieldMappings(
        target_attachment.field_mappings,
        unique_ats_attachment_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_ats_attachment_id,
        source_attachment,
      );

      const result_attachment = await this.getAttachment(
        unique_ats_attachment_id,
        undefined,
        undefined,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ats.attachment.created',
          method: 'POST',
          url: '/ats/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_attachment,
        'ats.attachment.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_attachment;
    } catch (error) {
      throw error;
    }
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async saveOrUpdateAttachment(
    attachment: UnifiedAttachmentOutput,
    connection_id: string,
  ): Promise<string> {
    const existingAttachment =
      await this.prisma.ats_candidate_attachments.findFirst({
        where: {
          remote_id: attachment.remote_id,
          id_connection: connection_id,
        },
      });

    const data: any = {
      file_url: attachment.file_url,
      file_name: attachment.file_name,
      file_type: attachment.attachment_type,
      remote_created_at: attachment.remote_created_at,
      remote_modified_at: attachment.remote_modified_at,
      modified_at: new Date(),
    };

    if (existingAttachment) {
      const res = await this.prisma.ats_candidate_attachments.update({
        where: {
          id_ats_candidate_attachment:
            existingAttachment.id_ats_candidate_attachment,
        },
        data: data,
      });
      return res.id_ats_candidate_attachment;
    } else {
      data.created_at = new Date();
      data.remote_id = attachment.remote_id;
      data.id_connection = connection_id;
      data.id_ats_candidate_attachment = uuidv4();

      const newAttachment = await this.prisma.ats_candidate_attachments.create({
        data: data,
      });
      return newAttachment.id_ats_candidate_attachment;
    }
  }

  async getAttachment(
    id_ats_attachment: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
    try {
      const attachment = await this.prisma.ats_candidate_attachments.findUnique(
        {
          where: { id_ats_candidate_attachment: id_ats_attachment },
        },
      );

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: attachment.id_ats_candidate_attachment,
          },
        },
        include: { attribute: true },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      const unifiedAttachment: UnifiedAttachmentOutput = {
        id: attachment.id_ats_candidate_attachment,
        file_url: attachment.file_url,
        file_name: attachment.file_name,
        attachment_type: attachment.file_type,
        remote_created_at: String(attachment.remote_created_at),
        remote_modified_at: String(attachment.remote_modified_at),
        candidate_id: attachment.id_ats_candidate,
        field_mappings: field_mappings,
        remote_id: attachment.remote_id,
        created_at: attachment.created_at,
        modified_at: attachment.modified_at,
      };

      let res: UnifiedAttachmentOutput = unifiedAttachment;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: attachment.id_ats_candidate_attachment },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_event: uuidv4(),
            status: 'success',
            type: 'ats.attachment.pull',
            method: 'GET',
            url: '/ats/attachment',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getAttachments(
    connection_id: string,
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
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent =
          await this.prisma.ats_candidate_attachments.findFirst({
            where: {
              id_connection: connection_id,
              id_ats_candidate_attachment: cursor,
            },
          });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const attachments = await this.prisma.ats_candidate_attachments.findMany({
        take: limit + 1,
        cursor: cursor ? { id_ats_candidate_attachment: cursor } : undefined,
        orderBy: { created_at: 'asc' },
        where: {
          id_connection: connection_id,
        },
      });

      if (attachments.length === limit + 1) {
        next_cursor = Buffer.from(
          attachments[attachments.length - 1].id_ats_candidate_attachment,
        ).toString('base64');
        attachments.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedAttachments: UnifiedAttachmentOutput[] = await Promise.all(
        attachments.map(async (attachment) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: attachment.id_ats_candidate_attachment,
              },
            },
            include: { attribute: true },
          });

          const fieldMappingsMap = new Map();
          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          return {
            id: attachment.id_ats_candidate_attachment,
            file_url: attachment.file_url,
            file_name: attachment.file_name,
            attachment_type: attachment.file_type,
            remote_created_at: String(attachment.remote_created_at),
            remote_modified_at: String(attachment.remote_modified_at),
            candidate_id: attachment.id_ats_candidate,
            field_mappings: field_mappings,
            remote_id: attachment.remote_id,
            created_at: attachment.created_at,
            modified_at: attachment.modified_at,
          };
        }),
      );

      let res: UnifiedAttachmentOutput[] = unifiedAttachments;

      if (remote_data) {
        const remote_array_data: UnifiedAttachmentOutput[] = await Promise.all(
          res.map(async (attachment) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: attachment.id },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...attachment, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.attachment.pull',
          method: 'GET',
          url: '/ats/attachments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return { data: res, prev_cursor, next_cursor };
    } catch (error) {
      throw error;
    }
  }
}
