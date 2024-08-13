import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisTimeoffInput,
  UnifiedHrisTimeoffOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';
import { HrisObject } from '@panora/shared';
import { ITimeoffService } from '../types';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class TimeoffService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimeoffService.name);
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async addTimeoff(
    unifiedTimeoffData: UnifiedHrisTimeoffInput,
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimeoffOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      // Add any necessary validations here, e.g., validateEmployeeId if needed

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedHrisTimeoffInput>({
          sourceObject: unifiedTimeoffData,
          targetType: HrisObject.timeoff,
          providerName: integrationId,
          vertical: 'hris',
          customFieldMappings: [],
        });

      const service: ITimeoffService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTimeoffOutput> = await service.addTimeoff(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalTimeoffOutput[]
      >({
        sourceObject: [resp.data],
        targetType: HrisObject.timeoff,
        providerName: integrationId,
        vertical: 'hris',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedHrisTimeoffOutput[];

      const source_timeoff = resp.data;
      const target_timeoff = unifiedObject[0];

      const unique_hris_timeoff_id = await this.saveOrUpdateTimeoff(
        target_timeoff,
        connectionId,
      );

      await this.ingestService.processRemoteData(
        unique_hris_timeoff_id,
        source_timeoff,
      );

      const result_timeoff = await this.getTimeoff(
        unique_hris_timeoff_id,
        undefined,
        undefined,
        connectionId,
        projectId,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: status_resp,
          type: 'hris.timeoff.push',
          method: 'POST',
          url: '/hris/timeoff',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_timeoff,
        'hris.timeoff.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_timeoff;
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateTimeoff(
    timeoff: UnifiedHrisTimeoffOutput,
    connectionId: string,
  ): Promise<string> {
    const existingTimeoff = await this.prisma.hris_time_off.findFirst({
      where: { remote_id: timeoff.remote_id, id_connection: connectionId },
    });

    const data: any = {
      employee: timeoff.employee,
      approver: timeoff.approver,
      status: timeoff.status,
      employee_note: timeoff.employee_note,
      units: timeoff.units,
      amount: timeoff.amount ? BigInt(timeoff.amount) : null,
      request_type: timeoff.request_type,
      start_time: timeoff.start_time ? new Date(timeoff.start_time) : null,
      end_time: timeoff.end_time ? new Date(timeoff.end_time) : null,
      field_mappings: timeoff.field_mappings,
      modified_at: new Date(),
    };

    if (existingTimeoff) {
      const res = await this.prisma.hris_time_off.update({
        where: { id_hris_time_off: existingTimeoff.id_hris_time_off },
        data: data,
      });

      return res.id_hris_time_off;
    } else {
      data.created_at = new Date();
      data.remote_id = timeoff.remote_id;
      data.id_connection = connectionId;
      data.id_hris_time_off = uuidv4();
      data.remote_was_deleted = timeoff.remote_was_deleted ?? false;
      data.remote_created_at = timeoff.remote_created_at
        ? new Date(timeoff.remote_created_at)
        : null;

      const newTimeoff = await this.prisma.hris_time_off.create({ data: data });

      return newTimeoff.id_hris_time_off;
    }
  }

  async getTimeoff(
    id_hris_time_off: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimeoffOutput> {
    try {
      const timeOff = await this.prisma.hris_time_off.findUnique({
        where: { id_hris_time_off: id_hris_time_off },
      });

      if (!timeOff) {
        throw new Error(`Time off with ID ${id_hris_time_off} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: timeOff.id_hris_time_off },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTimeOff: UnifiedHrisTimeoffOutput = {
        id: timeOff.id_hris_time_off,
        employee: timeOff.employee,
        approver: timeOff.approver,
        status: timeOff.status,
        employee_note: timeOff.employee_note,
        units: timeOff.units,
        amount: timeOff.amount ? Number(timeOff.amount) : undefined,
        request_type: timeOff.request_type,
        start_time: timeOff.start_time,
        end_time: timeOff.end_time,
        field_mappings: field_mappings,
        remote_id: timeOff.remote_id,
        remote_created_at: timeOff.remote_created_at,
        created_at: timeOff.created_at,
        modified_at: timeOff.modified_at,
        remote_was_deleted: timeOff.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: timeOff.id_hris_time_off },
        });
        unifiedTimeOff.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.time_off.pull',
          method: 'GET',
          url: '/hris/time_off',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTimeOff;
    } catch (error) {
      throw error;
    }
  }

  async getTimeoffs(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisTimeoffOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const timeOffs = await this.prisma.hris_time_off.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_time_off: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = timeOffs.length > limit;
      if (hasNextPage) timeOffs.pop();

      const unifiedTimeOffs = await Promise.all(
        timeOffs.map(async (timeOff) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: timeOff.id_hris_time_off },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTimeOff: UnifiedHrisTimeoffOutput = {
            id: timeOff.id_hris_time_off,
            employee: timeOff.employee,
            approver: timeOff.approver,
            status: timeOff.status,
            employee_note: timeOff.employee_note,
            units: timeOff.units,
            amount: timeOff.amount ? Number(timeOff.amount) : undefined,
            request_type: timeOff.request_type,
            start_time: timeOff.start_time,
            end_time: timeOff.end_time,
            field_mappings: field_mappings,
            remote_id: timeOff.remote_id,
            remote_created_at: timeOff.remote_created_at,
            created_at: timeOff.created_at,
            modified_at: timeOff.modified_at,
            remote_was_deleted: timeOff.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: timeOff.id_hris_time_off,
              },
            });
            unifiedTimeOff.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTimeOff;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.timeoff.pull',
          method: 'GET',
          url: '/hris/timeoffs',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTimeOffs,
        next_cursor: hasNextPage
          ? timeOffs[timeOffs.length - 1].id_hris_time_off
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
