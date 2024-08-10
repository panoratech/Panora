import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject, ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IEngagementService } from '../types';
import {
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class EngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(EngagementService.name);
  }

  async addEngagement(
    unifiedEngagementData: UnifiedCrmEngagementInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmEngagementOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateCompanyId(unifiedEngagementData.company_id);
      await this.validateEngagementType(unifiedEngagementData.type);
      await this.validateEngagementContacts(unifiedEngagementData.contacts);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.engagement',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmEngagementInput>({
          sourceObject: unifiedEngagementData,
          targetType: CrmObject.engagement,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      const service: IEngagementService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalEngagementOutput> =
        await service.addEngagement(
          desunifiedObject,
          linkedUserId,
          unifiedEngagementData.type.toUpperCase(),
        );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalEngagementOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.engagement,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: [],
        extraParams: {
          engagement_type: unifiedEngagementData.type.toUpperCase(),
        },
      })) as UnifiedCrmEngagementOutput[];

      const source_engagement = resp.data;
      const target_engagement = unifiedObject[0];

      const unique_crm_engagement_id = await this.saveOrUpdateEngagement(
        target_engagement,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_engagement.field_mappings,
        unique_crm_engagement_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_crm_engagement_id,
        source_engagement,
      );

      const result_engagement = await this.getEngagement(
        unique_crm_engagement_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.engagement.push', // sync, push or pull
          method: 'POST',
          url: '/crm/engagements',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_engagement,
        'crm.engagement.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_engagement;
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

  async validateCompanyId(companyId?: string) {
    if (companyId) {
      const company = await this.prisma.crm_companies.findUnique({
        where: { id_crm_company: companyId },
      });
      if (!company)
        throw new ReferenceError(
          'You inserted a company_id which does not exist',
        );
    }
  }

  async validateEngagementType(type?: string) {
    const upperType = type?.toUpperCase();
    if (upperType) {
      if (!ENGAGEMENTS_TYPE.includes(upperType)) {
        throw new ReferenceError(
          'You inserted an engagement type which does not exist',
        );
      }
    } else {
      throw new ReferenceError('You did not insert a type for your engagement');
    }
  }

  async validateEngagementContacts(contacts?: string[]) {
    if (contacts && contacts.length > 0) {
      await Promise.all(
        contacts.map(async (contact) => {
          const contactExists = await this.prisma.crm_contacts.findUnique({
            where: { id_crm_contact: contact },
          });
          if (!contactExists) {
            throw new ReferenceError(
              'You inserted an id_crm_engagement_contact which does not exist',
            );
          }
        }),
      );
    }
  }

  async saveOrUpdateEngagement(
    engagement: UnifiedCrmEngagementOutput,
    connection_id: string,
  ): Promise<string> {
    const existingEngagement = await this.prisma.crm_engagements.findFirst({
      where: { remote_id: engagement.remote_id, id_connection: connection_id },
    });

    const data: any = {
      modified_at: new Date(),
      content: engagement.content,
      direction: engagement.direction,
      subject: engagement.subject,
      start_at: engagement.start_at,
      end_time: engagement.end_time,
      type: engagement.type,
      id_crm_company: engagement.company_id,
    };

    if (existingEngagement) {
      const res = await this.prisma.crm_engagements.update({
        where: { id_crm_engagement: existingEngagement.id_crm_engagement },
        data: data,
      });
      return res.id_crm_engagement;
    } else {
      data.created_at = new Date();
      data.remote_id = engagement.remote_id;
      data.id_connection = connection_id;
      data.id_crm_engagement = uuidv4();

      const newEngagement = await this.prisma.crm_engagements.create({
        data: data,
      });
      return newEngagement.id_crm_engagement;
    }
  }

  async getEngagement(
    id_engagement: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmEngagementOutput> {
    try {
      const engagement = await this.prisma.crm_engagements.findUnique({
        where: {
          id_crm_engagement: id_engagement,
        },
      });

      // Fetch field mappings for the engagement
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: engagement.id_crm_engagement,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmEngagementOutput format
      const unifiedEngagement: UnifiedCrmEngagementOutput = {
        id: engagement.id_crm_engagement,
        content: engagement.content,
        direction: engagement.direction,
        subject: engagement.subject,
        start_at: engagement.start_at,
        end_time: engagement.end_time,
        type: engagement.type,
        company_id: engagement.id_crm_company,
        user_id: engagement.id_crm_user,
        field_mappings: field_mappings,
        remote_id: engagement.remote_id,
        created_at: engagement.created_at,
        modified_at: engagement.modified_at,
        contacts: engagement.contacts,
      };

      let res: UnifiedCrmEngagementOutput = {
        ...unifiedEngagement,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: engagement.id_crm_engagement,
          },
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
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'crm.engagement.pull',
            method: 'GET',
            url: '/crm/engagement',
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

  async getEngagements(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmEngagementOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_engagements.findFirst({
          where: {
            id_connection: connection_id,
            id_crm_engagement: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const engagements = await this.prisma.crm_engagements.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_engagement: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (engagements.length === limit + 1) {
        next_cursor = Buffer.from(
          engagements[engagements.length - 1].id_crm_engagement,
        ).toString('base64');
        engagements.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedEngagements: UnifiedCrmEngagementOutput[] =
        await Promise.all(
          engagements.map(async (engagement) => {
            // Fetch field mappings for the ticket
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: engagement.id_crm_engagement,
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

            // Transform to UnifiedCrmEngagementOutput format
            return {
              id: engagement.id_crm_engagement,
              content: engagement.content,
              direction: engagement.direction,
              subject: engagement.subject,
              start_at: engagement.start_at,
              end_time: engagement.end_time,
              type: engagement.type,
              company_id: engagement.id_crm_company,
              user_id: engagement.id_crm_user,
              field_mappings: field_mappings,
              remote_id: engagement.remote_id,
              created_at: engagement.created_at,
              modified_at: engagement.modified_at,
              contacts: engagement.contacts,
            };
          }),
        );

      let res: UnifiedCrmEngagementOutput[] = unifiedEngagements;

      if (remote_data) {
        const remote_array_data: UnifiedCrmEngagementOutput[] =
          await Promise.all(
            res.map(async (engagement) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: engagement.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...engagement, remote_data };
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
          type: 'crm.engagement.pulled',
          method: 'GET',
          url: '/crm/engagements',
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
}
