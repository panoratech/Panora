import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IApplicationService } from '../types';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(ApplicationService.name);
  }

  async addApplication(
    unifiedApplicationData: UnifiedApplicationInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.application',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedApplicationInput>({
          sourceObject: unifiedApplicationData,
          targetType: AtsObject.application,
          providerName: integrationId,
          vertical: 'ats',
          customFieldMappings: unifiedApplicationData.field_mappings
            ? customFieldMappings
            : [],
        });

      const service = this.serviceRegistry.getService(
        integrationId,
      ) as IApplicationService;
      const resp: ApiResponse<OriginalApplicationOutput> =
        await service.addApplication(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalApplicationOutput[]
      >({
        sourceObject: [resp.data],
        targetType: AtsObject.application,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedApplicationOutput[];

      const source_application = resp.data;
      const target_application = unifiedObject[0];

      const unique_ats_application_id = await this.saveOrUpdateApplication(
        target_application,
        connection_id,
      );

      if (target_application.candidate_id) {
        await this.prisma.ats_applications.update({
          where: {
            id_ats_application: unique_ats_application_id,
          },
          data: {
            id_ats_candidate: target_application.candidate_id,
          },
        });
      }

      await this.ingestService.processFieldMappings(
        target_application.field_mappings,
        unique_ats_application_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_ats_application_id,
        source_application,
      );

      const result_application = await this.getApplication(
        unique_ats_application_id,
        undefined,
        undefined,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ats.application.created',
          method: 'POST',
          url: '/ats/applications',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_application,
        'ats.application.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_application;
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

  async saveOrUpdateApplication(
    application: UnifiedApplicationOutput,
    connection_id: string,
  ): Promise<string> {
    const existingApplication = await this.prisma.ats_applications.findFirst({
      where: { remote_id: application.remote_id, id_connection: connection_id },
    });

    const data: any = {
      applied_at: application.applied_at,
      rejected_at: application.rejected_at,
      offers: application.offers,
      source: application.source,
      credited_to: application.credited_to,
      current_stage: application.current_stage,
      reject_reason: application.reject_reason,
      id_ats_job: application.job_id,
      modified_at: new Date(),
    };

    if (existingApplication) {
      const res = await this.prisma.ats_applications.update({
        where: { id_ats_application: existingApplication.id_ats_application },
        data: data,
      });
      return res.id_ats_application;
    } else {
      data.created_at = new Date();
      data.remote_id = application.remote_id;
      data.id_connection = connection_id;
      data.id_ats_application = uuidv4();

      const newApplication = await this.prisma.ats_applications.create({
        data: data,
      });
      return newApplication.id_ats_application;
    }
  }

  async getApplication(
    id_ats_application: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput> {
    try {
      const application = await this.prisma.ats_applications.findUnique({
        where: { id_ats_application: id_ats_application },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: application.id_ats_application },
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

      const resOffers = await this.prisma.ats_offers.findMany({
        where: {
          id_ats_application: application.id_ats_application,
        },
      });
      let offers;
      if (resOffers && resOffers.length > 0) {
        offers = resOffers.map((off) => {
          return off.id_ats_offer;
        });
      }
      const unifiedApplication: UnifiedApplicationOutput = {
        id: application.id_ats_application,
        applied_at: String(application.applied_at) || null,
        rejected_at: String(application.rejected_at) || null,
        offers: offers || null,
        source: application.source || null,
        credited_to: application.credited_to || null,
        current_stage: application.current_stage || null,
        reject_reason: application.reject_reason || null,
        candidate_id: application.id_ats_candidate || null,
        job_id: application.id_ats_job || null,
        field_mappings: field_mappings,
        remote_id: application.remote_id || null,
        created_at: application.created_at || null,
        modified_at: application.modified_at || null,
        remote_created_at: null,
        remote_modified_at: null,
      };

      let res: UnifiedApplicationOutput = unifiedApplication;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: application.id_ats_application },
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
            type: 'ats.application.pull',
            method: 'GET',
            url: '/ats/application',
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

  async getApplications(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedApplicationOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_applications.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_application: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const applications = await this.prisma.ats_applications.findMany({
        take: limit + 1,
        cursor: cursor ? { id_ats_application: cursor } : undefined,
        orderBy: { created_at: 'asc' },
        where: {
          id_connection: connection_id,
        },
      });

      if (applications.length === limit + 1) {
        next_cursor = Buffer.from(
          applications[applications.length - 1].id_ats_application,
        ).toString('base64');
        applications.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedApplications: UnifiedApplicationOutput[] = await Promise.all(
        applications.map(async (application) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: application.id_ats_application },
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

          const resOffers = await this.prisma.ats_offers.findMany({
            where: {
              id_ats_application: application.id_ats_application,
            },
          });
          let offers;
          if (resOffers && resOffers.length > 0) {
            offers = resOffers.map((off) => {
              return off.id_ats_offer;
            });
          }

          return {
            id: application.id_ats_application,
            applied_at: String(application.applied_at) || null,
            rejected_at: String(application.rejected_at) || null,
            offers: offers || null,
            source: application.source || null,
            credited_to: application.credited_to || null,
            current_stage: application.current_stage || null,
            reject_reason: application.reject_reason || null,
            candidate_id: application.id_ats_candidate || null,
            job_id: application.id_ats_job || null,
            field_mappings: field_mappings,
            remote_id: application.remote_id || null,
            created_at: application.created_at || null,
            modified_at: application.modified_at || null,
            remote_created_at: null,
            remote_modified_at: null,
          };
        }),
      );

      let res: UnifiedApplicationOutput[] = unifiedApplications;

      if (remote_data) {
        const remote_array_data: UnifiedApplicationOutput[] = await Promise.all(
          res.map(async (application) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: application.id },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...application, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.application.pull',
          method: 'GET',
          url: '/ats/applications',
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
