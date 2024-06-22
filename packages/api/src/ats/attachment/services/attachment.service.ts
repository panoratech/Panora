import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ats';
import { IAttachmentService } from '../types';
import { CoreUnification } from '@@core/utils/services/core.service';
import { AtsObject } from '@ats/@lib/@types';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(AttachmentService.name);
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
        await service.addAttachment(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: [resp.data],
        targetType: AtsObject.attachment,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings: customFieldMappings,
      })) as UnifiedAttachmentOutput[];

      const source_attachment = resp.data;
      const target_attachment = unifiedObject[0];

      const existingAttachment =
        await this.prisma.ats_candidate_attachments.findFirst({
          where: {
            remote_id: target_attachment.remote_id,
            remote_platform: integrationId,
            id_linked_user: linkedUserId,
          },
        });

      let unique_ats_attachment_id: string;

      if (existingAttachment) {
        const data: any = {
          file_url: target_attachment.file_url,
          file_name: target_attachment.file_name,
          file_type: target_attachment.file_type,
          remote_created_at: target_attachment.remote_created_at,
          remote_modified_at: target_attachment.remote_modified_at,
          modified_at: new Date(),
        };

        const res = await this.prisma.ats_candidate_attachments.update({
          where: {
            id_ats_candidate_attachment:
              existingAttachment.id_ats_candidate_attachment,
          },
          data: data,
        });

        unique_ats_attachment_id = res.id_ats_candidate_attachment;
      } else {
        const data: any = {
          id_ats_candidate_attachment: uuidv4(),
          file_url: target_attachment.file_url,
          file_name: target_attachment.file_name,
          file_type: target_attachment.file_type,
          remote_created_at: target_attachment.remote_created_at,
          remote_modified_at: target_attachment.remote_modified_at,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_attachment.remote_id,
          remote_platform: integrationId,
        };

        const newAttachment =
          await this.prisma.ats_candidate_attachments.create({
            data: data,
          });

        unique_ats_attachment_id = newAttachment.id_ats_candidate_attachment;
      }

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

      if (
        target_attachment.field_mappings &&
        target_attachment.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_ats_attachment_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_attachment.field_mappings,
        )) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: slug,
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: value || 'null',
                attribute: {
                  connect: { id_attribute: attribute.id_attribute },
                },
                entity: { connect: { id_entity: entity.id_entity } },
              },
            });
          }
        }
      }

      await this.prisma.remote_data.upsert({
        where: { ressource_owner_id: unique_ats_attachment_id },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ats_attachment_id,
          format: 'json',
          data: JSON.stringify(source_attachment),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_attachment),
          created_at: new Date(),
        },
      });

      const result_attachment = await this.getAttachment(
        unique_ats_attachment_id,
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
      await this.webhook.handleWebhook(
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

  async getAttachment(
    id_ats_attachment: string,
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
        file_type: attachment.file_type,
        remote_created_at: attachment.remote_created_at,
        remote_modified_at: attachment.remote_modified_at,
        candidate_id: attachment.id_ats_candidate,
        field_mappings: field_mappings,
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
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent =
          await this.prisma.ats_candidate_attachments.findFirst({
            where: {
              remote_platform: integrationId.toLowerCase(),
              id_linked_user: linkedUserId,
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
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
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
            file_type: attachment.file_type,
            remote_created_at: attachment.remote_created_at,
            remote_modified_at: attachment.remote_modified_at,
            candidate_id: attachment.id_ats_candidate,
            field_mappings: field_mappings,
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

      const event = await this.prisma.events.create({
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

  async updateAttachment(
    id: string,
    updateAttachmentData: Partial<UnifiedAttachmentInput>,
  ): Promise<UnifiedAttachmentOutput> {
    try {
    } catch (error) {}
    return;
  }
}
