import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { IActivityService } from '../types';
import { CoreUnification } from '@@core/utils/services/core.service';
import { AtsObject } from '@ats/@lib/@types';

@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(ActivityService.name);
  }

  async addActivity(
    unifiedActivityData: UnifiedActivityInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: { id_linked_user: linkedUserId },
      });

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.activity',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedActivityInput>({
          sourceObject: unifiedActivityData,
          targetType: AtsObject.activity,
          providerName: integrationId,
          vertical: 'ats',
          customFieldMappings: unifiedActivityData.field_mappings
            ? customFieldMappings
            : [],
        });

      const service = this.serviceRegistry.getService(
        integrationId,
      ) as IActivityService;
      const resp: ApiResponse<OriginalActivityOutput> =
        await service.addActivity(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalActivityOutput[]
      >({
        sourceObject: [resp.data],
        targetType: AtsObject.activity,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings: customFieldMappings,
      })) as UnifiedActivityOutput[];

      const source_activity = resp.data;
      const target_activity = unifiedObject[0];

      const existingActivity = await this.prisma.ats_activities.findFirst({
        where: {
          remote_id: target_activity.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_ats_activity_id: string;

      if (existingActivity) {
        const data: any = {
          activity_type: target_activity.activity_type,
          subject: target_activity.subject,
          body: target_activity.body,
          visibility: target_activity.visibility,
          remote_created_at: target_activity.remote_created_at,
          modified_at: new Date(),
        };

        const res = await this.prisma.ats_activities.update({
          where: { id_ats_activity: existingActivity.id_ats_activity },
          data: data,
        });

        unique_ats_activity_id = res.id_ats_activity;
      } else {
        const data: any = {
          id_ats_activity: uuidv4(),
          activity_type: target_activity.activity_type,
          subject: target_activity.subject,
          body: target_activity.body,
          visibility: target_activity.visibility,
          remote_created_at: target_activity.remote_created_at,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_activity.remote_id,
          remote_platform: integrationId,
        };

        const newActivity = await this.prisma.ats_activities.create({
          data: data,
        });

        unique_ats_activity_id = newActivity.id_ats_activity;
      }

      if (target_activity.candidate_id) {
        await this.prisma.ats_applications.update({
          where: {
            id_ats_application: unique_ats_activity_id,
          },
          data: {
            id_ats_candidate: target_activity.candidate_id,
          },
        });
      }

      if (
        target_activity.field_mappings &&
        target_activity.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_ats_activity_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_activity.field_mappings,
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
        where: { ressource_owner_id: unique_ats_activity_id },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ats_activity_id,
          format: 'json',
          data: JSON.stringify(source_activity),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_activity),
          created_at: new Date(),
        },
      });

      const result_activity = await this.getActivity(
        unique_ats_activity_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ats.activity.created',
          method: 'POST',
          url: '/ats/activities',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_activity,
        'ats.activity.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_activity;
    } catch (error) {
      throw error;
    }
  }

  async getActivity(
    id_ats_activity: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput> {
    try {
      const activity = await this.prisma.ats_activities.findUnique({
        where: { id_ats_activity: id_ats_activity },
      });

      const values = await this.prisma.value.findMany({
        where: { entity: { ressource_owner_id: activity.id_ats_activity } },
        include: { attribute: true },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      const unifiedActivity: UnifiedActivityOutput = {
        id: activity.id_ats_activity,
        activity_type: activity.activity_type,
        subject: activity.subject,
        body: activity.body,
        visibility: activity.visibility,
        candidate_id: activity.id_ats_candidate,
        remote_created_at: activity.remote_created_at,
        field_mappings: field_mappings,
      };

      let res: UnifiedActivityOutput = unifiedActivity;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: activity.id_ats_activity },
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

  async getActivities(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedActivityOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_activities.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_ats_activity: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const activities = await this.prisma.ats_activities.findMany({
        take: limit + 1,
        cursor: cursor ? { id_ats_activity: cursor } : undefined,
        orderBy: { created_at: 'asc' },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (activities.length === limit + 1) {
        next_cursor = Buffer.from(
          activities[activities.length - 1].id_ats_activity,
        ).toString('base64');
        activities.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedActivities: UnifiedActivityOutput[] = await Promise.all(
        activities.map(async (activity) => {
          const values = await this.prisma.value.findMany({
            where: { entity: { ressource_owner_id: activity.id_ats_activity } },
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
            id: activity.id_ats_activity,
            activity_type: activity.activity_type,
            subject: activity.subject,
            body: activity.body,
            visibility: activity.visibility,
            candidate_id: activity.id_ats_candidate,
            remote_created_at: activity.remote_created_at,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedActivityOutput[] = unifiedActivities;

      if (remote_data) {
        const remote_array_data: UnifiedActivityOutput[] = await Promise.all(
          res.map(async (activity) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: activity.id },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...activity, remote_data };
          }),
        );

        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.activity.pull',
          method: 'GET',
          url: '/ats/activities',
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

  async updateActivity(
    id: string,
    updateActivityData: Partial<UnifiedActivityInput>,
  ): Promise<UnifiedActivityOutput> {
    try {
      // TODO: fetch the activity from the database using 'id'
      // TODO: update the activity with 'updateActivityData'
      // TODO: save the updated activity back to the database
      // TODO: return the updated activity
      return;
    } catch (error) {
      throw error;
    }
  }
}
