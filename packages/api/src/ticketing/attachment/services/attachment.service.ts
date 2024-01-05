import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '../types/model.unified';
import { AttachmentResponse, IAttachmentService } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { ServiceRegistry } from './registry.service';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';

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

  async batchAddAttachments(
    unifiedAttachmentData: UnifiedAttachmentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AttachmentResponse>> {
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

      const allAttachments = responses.flatMap(
        (response) => response.data.attachments,
      );
      const allRemoteData = responses.flatMap(
        (response) => response.data.remote_data || [],
      );

      return {
        data: {
          attachments: allAttachments,
          remote_data: allRemoteData,
        },
        message: 'All attachments inserted successfully',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async addAttachment(
    unifiedAttachmentData: UnifiedAttachmentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AttachmentResponse>> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      if (!linkedUser) throw new Error('Linked User Not Found');

      //TODO
      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'attachment',
        );
      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<UnifiedAttachmentInput>({
        sourceObject: unifiedAttachmentData,
        targetType: TicketingObject.attachment,
        providerName: integrationId,
        customFieldMappings: unifiedAttachmentData.field_mappings
          ? customFieldMappings
          : [],
      });

      const service: IAttachmentService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalAttachmentOutput> =
        await service.addAttachment(desunifiedObject, linkedUserId);

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
        sourceObject: [resp.data],
        targetType: TicketingObject.attachment,
        providerName: integrationId,
        customFieldMappings: customFieldMappings,
      })) as UnifiedAttachmentOutput[];

      // add the attachment inside our db
      const source_attachment = resp.data;
      const target_attachment = unifiedObject[0];
      const originId =
        'id' in source_attachment ? String(source_attachment.id) : undefined; //TODO

      const existingAttachment = await this.prisma.tcg_attachments.findFirst({
        where: {
          remote_id: originId,
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
            //TODO
            modified_at: new Date(),
          },
        });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      } else {
        // Create a new attachment
        this.logger.log('not existing attachment ' + target_attachment);
        const data = {
          id_tcg_attachment: uuidv4(),
          //TODO

          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: originId,
          remote_platform: integrationId,
        };

        const res = await this.prisma.tcg_attachments.create({
          data: data,
        });
        unique_ticketing_attachment_id = res.id_tcg_attachment;
      }

      // check duplicate or existing values
      if (
        target_attachment.field_mappings &&
        target_attachment.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_ticketing_attachment_id,
          },
        });

        for (const mapping of target_attachment.field_mappings) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: Object.keys(mapping)[0],
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: Object.values(mapping)[0] || 'null',
                attribute: {
                  connect: {
                    id_attribute: attribute.id_attribute,
                  },
                },
                entity: {
                  connect: {
                    id_entity: entity.id_entity,
                  },
                },
              },
            });
          }
        }
      }
      if (remote_data) {
        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_attachment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_attachment_id,
            format: 'json',
            data: JSON.stringify(source_attachment),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(source_attachment),
            created_at: new Date(),
          },
        });
      }

      const result_attachment = await this.getAttachment(
        unique_ticketing_attachment_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.attachment.push', //sync, push or pull
          method: 'POST',
          url: '/ticketing/attachment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        result_attachment.data.attachments,
        'ticketing.attachment.created',
        linkedUser.id_project,
        event.id_event,
      );
      return { ...resp, data: result_attachment.data };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getAttachment(
    id_ticketing_attachment: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AttachmentResponse>> {
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
        //TODO
        field_mappings: field_mappings,
      };

      let res: AttachmentResponse = {
        attachments: [unifiedAttachment],
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: attachment.id_tcg_attachment,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: [remote_data],
        };
      }

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getAttachments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AttachmentResponse>> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.attachment.pull',
          method: 'GET',
          url: '/ticketing/attachment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;
      const attachments = await this.prisma.tcg_attachments.findMany({
        where: {
          remote_id: integrationId.toLowerCase(),
          events: {
            id_linked_user: linkedUserId,
          },
        },
      });

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
            //TODO
            field_mappings: field_mappings,
          };
        }),
      );

      let res: AttachmentResponse = {
        attachments: unifiedAttachments,
      };

      if (remote_data) {
        const remote_array_data: Record<string, any>[] = await Promise.all(
          attachments.map(async (attachment) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: attachment.id_tcg_attachment,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return remote_data;
          }),
        );

        res = {
          ...res,
          remote_data: remote_array_data,
        };
      }
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //TODO
  async downloadAttachment(
    id_ticketing_attachment: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AttachmentResponse>> {
    return;
  }
}
