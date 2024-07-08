import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IActivityService } from '../types';
import {
  ActivityType,
  ActivityVisibility,
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(ActivityService.name);
  }

  async addActivity(
    unifiedActivityData: UnifiedActivityInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

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
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedActivityOutput[];

      const source_activity = resp.data;
      const target_activity = unifiedObject[0];

      const unique_ats_activity_id = await this.saveOrUpdateActivity(
        target_activity,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_activity.field_mappings,
        unique_ats_activity_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_ats_activity_id,
        source_activity,
      );

      const result_activity = await this.getActivity(
        unique_ats_activity_id,
        undefined,
        undefined,
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
      await this.webhook.dispatchWebhook(
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

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async saveOrUpdateActivity(
    activity: UnifiedActivityOutput,
    connection_id: string,
  ): Promise<string> {
    const existingActivity = await this.prisma.ats_activities.findFirst({
      where: { remote_id: activity.remote_id, id_connection: connection_id },
    });

    const data: any = {
      activity_type: activity.activity_type,
      subject: activity.subject,
      body: activity.body,
      visibility: activity.visibility,
      remote_created_at: activity.remote_created_at,
      modified_at: new Date(),
    };

    if (existingActivity) {
      const res = await this.prisma.ats_activities.update({
        where: { id_ats_activity: existingActivity.id_ats_activity },
        data: data,
      });
      return res.id_ats_activity;
    } else {
      data.created_at = new Date();
      data.remote_id = activity.remote_id;
      data.id_connection = connection_id;
      data.id_ats_activity = uuidv4();

      const newActivity = await this.prisma.ats_activities.create({
        data: data,
      });
      return newActivity.id_ats_activity;
    }
  }

  async getActivity(
    id_ats_activity: string,
    linkedUserId: string,
    integrationId: string,
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
        remote_created_at: String(activity.remote_created_at),
        field_mappings: field_mappings,
        remote_id: activity.remote_id,
        created_at: activity.created_at,
        modified_at: activity.modified_at,
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
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_event: uuidv4(),
            status: 'success',
            type: 'ats.activity.pull',
            method: 'GET',
            url: '/ats/activity',
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

  async getActivities(
    connection_id: string,
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
            id_connection: connection_id,
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
          id_connection: connection_id,
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
            remote_created_at: String(activity.remote_created_at),
            field_mappings: field_mappings,
            remote_id: activity.remote_id,
            created_at: activity.created_at,
            modified_at: activity.modified_at,
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

      await this.prisma.events.create({
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
}
