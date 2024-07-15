import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import {
  OriginalApplicationOutput,
  OriginalAttachmentOutput,
  OriginalCandidateOutput,
} from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICandidateService } from '../types';
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from '@ats/application/types/model.unified';
import { ServiceRegistry as ApplicationServiceRegistry } from '@ats/application/services/registry.service';
import { ServiceRegistry as AttachmentServiceRegistry } from '@ats/attachment/services/registry.service';
import { IApplicationService } from '@ats/application/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ats/attachment/types/model.unified';
import { IAttachmentService } from '@ats/attachment/types';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private registry: CoreSyncRegistry,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private applicationServiceRegistry: ApplicationServiceRegistry,
    private attachmentServiceRegistry: AttachmentServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(CandidateService.name);
  }

  async addCandidate(
    unifiedCandidateData: UnifiedCandidateInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.candidate',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCandidateInput>({
          sourceObject: unifiedCandidateData,
          targetType: AtsObject.candidate,
          providerName: integrationId,
          vertical: 'ats',
          customFieldMappings: unifiedCandidateData.field_mappings
            ? customFieldMappings
            : [],
        });

      const service = this.serviceRegistry.getService(
        integrationId,
      ) as ICandidateService;
      const resp: ApiResponse<OriginalCandidateOutput> =
        await service.addCandidate(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalCandidateOutput[]
      >({
        sourceObject: [resp.data],
        targetType: AtsObject.candidate,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedCandidateOutput[];

      const source_candidate = resp.data;
      const target_candidate = unifiedObject[0];

      const unique_ats_candidate_id = await this.saveOrUpdateCandidate(
        target_candidate,
        connection_id,
      );

      await this.processAttachments(
        unifiedCandidateData.attachments,
        unique_ats_candidate_id,
        connection_id,
        linkedUserId,
        integrationId,
      );

      // now that we have inserted our candidate, we might have an application nested that we have to insert
      await this.processApplication(
        unifiedCandidateData.applications[0],
        unique_ats_candidate_id,
        connection_id,
        linkedUserId,
        integrationId,
      );

      // Update related objects, if any (e.g., tags)
      // Assuming there is a method to handle tags and other related objects

      await this.ingestService.processFieldMappings(
        target_candidate.field_mappings,
        unique_ats_candidate_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_ats_candidate_id,
        source_candidate,
      );

      const result_candidate = await this.getCandidate(
        unique_ats_candidate_id,
        undefined,
        undefined,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ats.candidate.created',
          method: 'POST',
          url: '/ats/candidates',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_candidate,
        'ats.candidate.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_candidate;
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

  async processAttachments(
    attachments: any[],
    candidate_id: string,
    connection_id: string,
    linkedUserId: string,
    integrationId: string,
  ): Promise<string[]> {
    try {
      if (attachments && attachments.length > 0) {
        if (typeof attachments[0] === 'string') {
          await Promise.all(
            attachments.map(async (uuid: string) => {
              const attachment =
                await this.prisma.ats_candidate_attachments.findUnique({
                  where: { id_ats_candidate_attachment: uuid },
                });
              if (!attachment)
                throw new ReferenceError(
                  'You inserted an ats_attachment_id which does not exist',
                );
            }),
          );
          return attachments;
        } else {
          await Promise.all(
            attachments.map(async (unified_attachmt) => {
              unified_attachmt.candidate_id = candidate_id; // we insert the candidate_id on the fly as it may be mandatory for some providers when creating an application
              const desunifiedObject =
                await this.coreUnification.desunify<UnifiedAttachmentInput>({
                  sourceObject: unified_attachmt,
                  targetType: AtsObject.attachment,
                  providerName: integrationId,
                  vertical: 'ats',
                  customFieldMappings: [],
                });

              const service = this.attachmentServiceRegistry.getService(
                integrationId,
              ) as IAttachmentService;

              const attachment_type = unified_attachmt.attachment_type;

              const resp: ApiResponse<OriginalAttachmentOutput> =
                await service.addAttachment(
                  desunifiedObject,
                  linkedUserId,
                  attachment_type,
                );

              const unifiedObject = (await this.coreUnification.unify<
                OriginalAttachmentOutput[]
              >({
                sourceObject: [resp.data],
                targetType: AtsObject.attachment,
                providerName: integrationId,
                vertical: 'ats',
                connectionId: connection_id,
                customFieldMappings: [],
              })) as UnifiedAttachmentOutput[];

              await this.saveOrUpdateAttachment(
                unifiedObject[0],
                connection_id,
              );
            }),
          );
        }
      }
      return [];
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateAttachment(
    att: UnifiedAttachmentOutput,
    connection_id: string,
  ): Promise<string> {
    try {
      let existingAtt;

      if (att.remote_id) {
        existingAtt = await this.prisma.ats_candidate_attachments.findFirst({
          where: {
            remote_id: att.remote_id,
            id_connection: connection_id,
          },
        });
      } else {
        existingAtt = await this.prisma.ats_candidate_attachments.findFirst({
          where: {
            file_name: att.file_name,
            file_url: att.file_url,
            id_connection: connection_id,
          },
        });
      }

      const data: any = {
        file_name: att.file_name,
        file_url: att.file_url,
        attachment_type: att.attachment_type,
        id_ats_candidate: att.candidate_id,
        modified_at: new Date(),
      };

      if (existingAtt) {
        const res = await this.prisma.ats_candidate_attachments.update({
          where: {
            id_ats_candidate_attachment:
              existingAtt.id_ats_candidate_attachment,
          },
          data: data,
        });
        return res.id_ats_candidate_attachment;
      } else {
        data.created_at = new Date();
        data.remote_id = att.remote_id;
        data.id_connection = connection_id;
        data.id_ats_application = uuidv4();

        const newApp = await this.prisma.ats_candidate_attachments.create({
          data: data,
        });
        return newApp.id_ats_candidate_attachment;
      }
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateApplication(
    application: UnifiedApplicationOutput,
    connection_id: string,
  ): Promise<string> {
    try {
      const existingApp = await this.prisma.ats_applications.findFirst({
        where: {
          remote_id: application.remote_id,
          id_connection: connection_id,
        },
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
        id_ats_candidate: application.candidate_id,
        modified_at: new Date(),
      };

      if (existingApp) {
        const res = await this.prisma.ats_applications.update({
          where: { id_ats_application: existingApp.id_ats_candidate },
          data: data,
        });
        return res.id_ats_application;
      } else {
        data.created_at = new Date();
        data.remote_id = application.remote_id;
        data.id_connection = connection_id;
        data.id_ats_application = uuidv4();

        const newApp = await this.prisma.ats_applications.create({
          data: data,
        });
        return newApp.id_ats_application;
      }
    } catch (error) {
      throw error;
    }
  }

  async processApplication(
    application: any,
    candidate_id: string,
    connection_id: string,
    linkedUserId: string,
    integrationId: string,
  ) {
    try {
      if (application) {
        if (typeof application === 'string') {
          const app = await this.prisma.ats_applications.findUnique({
            where: { id_ats_application: application },
          });
          if (!app)
            throw new ReferenceError(
              'You inserted an ats_application which does not exist',
            );
          await this.prisma.ats_applications.update({
            where: {
              id_ats_application: app.id_ats_application,
            },
            data: {
              id_ats_candidate: candidate_id,
            },
          });
        } else {
          application.candidate_id = candidate_id; // we insert the candidate_id on the fly as it may be mandatory for some providers when creating an application
          const desunifiedObject =
            await this.coreUnification.desunify<UnifiedApplicationInput>({
              sourceObject: application,
              targetType: AtsObject.application,
              providerName: integrationId,
              vertical: 'ats',
              customFieldMappings: [],
            });

          const service = this.applicationServiceRegistry.getService(
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
            customFieldMappings: [],
          })) as UnifiedApplicationOutput[];

          await this.saveOrUpdateApplication(unifiedObject[0], connection_id);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateCandidate(
    candidate: UnifiedCandidateOutput,
    connection_id: string,
  ): Promise<string> {
    try {
      const existingCandidate = await this.prisma.ats_candidates.findFirst({
        where: { remote_id: candidate.remote_id, id_connection: connection_id },
      });

      const data: any = {
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        company: candidate.company,
        title: candidate.title,
        remote_created_at: candidate.remote_created_at,
        remote_modified_at: candidate.remote_modified_at,
        last_interaction_at: candidate.last_interaction_at,
        is_private: candidate.is_private,
        email_reachable: candidate.email_reachable,
        locations: candidate.locations,
        modified_at: new Date(),
      };

      if (existingCandidate) {
        const res = await this.prisma.ats_candidates.update({
          where: { id_ats_candidate: existingCandidate.id_ats_candidate },
          data: data,
        });
        return res.id_ats_candidate;
      } else {
        data.created_at = new Date();
        data.remote_id = candidate.remote_id;
        data.id_connection = connection_id;
        data.id_ats_candidate = uuidv4();

        const newCandidate = await this.prisma.ats_candidates.create({
          data: data,
        });
        return newCandidate.id_ats_candidate;
      }
    } catch (error) {
      throw error;
    }
  }

  async getCandidate(
    id_ats_candidate: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
    try {
      const candidate = await this.prisma.ats_candidates.findUnique({
        where: { id_ats_candidate: id_ats_candidate },
      });

      const attachments = await this.prisma.ats_candidate_attachments.findMany({
        where: { id_ats_candidate: id_ats_candidate },
      });

      const applications = await this.prisma.ats_applications.findMany({
        where: { id_ats_candidate: id_ats_candidate },
      });

      const emailAddresses =
        await this.prisma.ats_candidate_email_addresses.findMany({
          where: { id_ats_candidate: id_ats_candidate },
        });

      const phoneNumbers =
        await this.prisma.ats_candidate_phone_numbers.findMany({
          where: { id_ats_candidate: id_ats_candidate },
        });

      const urls = await this.prisma.ats_candidate_urls.findMany({
        where: { id_ats_candidate: id_ats_candidate },
      });

      const values = await this.prisma.value.findMany({
        where: { entity: { ressource_owner_id: candidate.id_ats_candidate } },
        include: { attribute: true },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      const unifiedCandidate: UnifiedCandidateOutput = {
        id: candidate.id_ats_candidate,
        remote_id: candidate.remote_id,
        created_at: candidate.created_at,
        modified_at: candidate.modified_at,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        company: candidate.company,
        title: candidate.title,
        remote_created_at: String(candidate.remote_created_at),
        remote_modified_at: String(candidate.remote_modified_at),
        last_interaction_at: String(candidate.last_interaction_at),
        is_private: candidate.is_private,
        email_reachable: candidate.email_reachable,
        locations: candidate.locations,
        attachments: attachments.map(
          (attachment) => attachment.id_ats_candidate_attachment,
        ),
        applications: applications.map(
          (application) => application.id_ats_application,
        ),
        email_addresses: emailAddresses.map((email) => ({
          email_address: email.value,
          email_address_type: email.type,
        })),
        phone_numbers: phoneNumbers.map((phone) => ({
          phone_number: phone.value,
          phone_type: phone.type,
        })),
        tags: candidate.tags,
        urls: urls.map((url) => ({
          url: url.value,
          url_type: url.type,
        })),
        field_mappings: field_mappings,
      };

      let res: UnifiedCandidateOutput = unifiedCandidate;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: candidate.id_ats_candidate },
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
            type: 'ats.candidate.pull',
            method: 'GET',
            url: '/ats/candidate',
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

  async getCandidates(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCandidateOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_candidates.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_candidate: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const candidates = await this.prisma.ats_candidates.findMany({
        take: limit + 1,
        cursor: cursor ? { id_ats_candidate: cursor } : undefined,
        orderBy: { created_at: 'asc' },
        where: {
          id_connection: connection_id,
        },
      });

      if (candidates.length === limit + 1) {
        next_cursor = Buffer.from(
          candidates[candidates.length - 1].id_ats_candidate,
        ).toString('base64');
        candidates.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedCandidates: UnifiedCandidateOutput[] = await Promise.all(
        candidates.map(async (candidate) => {
          const attachments =
            await this.prisma.ats_candidate_attachments.findMany({
              where: { id_ats_candidate: candidate.id_ats_candidate },
            });

          const applications = await this.prisma.ats_applications.findMany({
            where: { id_ats_candidate: candidate.id_ats_candidate },
          });

          const emailAddresses =
            await this.prisma.ats_candidate_email_addresses.findMany({
              where: { id_ats_candidate: candidate.id_ats_candidate },
            });

          const phoneNumbers =
            await this.prisma.ats_candidate_phone_numbers.findMany({
              where: { id_ats_candidate: candidate.id_ats_candidate },
            });
          const urls = await this.prisma.ats_candidate_urls.findMany({
            where: { id_ats_candidate: candidate.id_ats_candidate },
          });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: candidate.id_ats_candidate },
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
            id: candidate.id_ats_candidate,
            remote_id: candidate.remote_id,
            created_at: candidate.created_at,
            modified_at: candidate.modified_at,
            first_name: candidate.first_name,
            last_name: candidate.last_name,
            company: candidate.company,
            title: candidate.title,
            remote_created_at: String(candidate.remote_created_at),
            remote_modified_at: String(candidate.remote_modified_at),
            last_interaction_at: String(candidate.last_interaction_at),
            is_private: candidate.is_private,
            email_reachable: candidate.email_reachable,
            locations: candidate.locations,
            attachments: attachments.map(
              (attachment) => attachment.id_ats_candidate_attachment,
            ),
            applications: applications.map(
              (application) => application.id_ats_application,
            ),
            email_addresses: emailAddresses.map((email) => ({
              email_address: email.value,
              email_address_type: email.type,
            })),
            phone_numbers: phoneNumbers.map((phone) => ({
              phone_number: phone.value,
              phone_type: phone.type,
            })),
            tags: candidate.tags,
            urls: urls.map((url) => ({
              url: url.value,
              url_type: url.type,
            })),
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedCandidateOutput[] = unifiedCandidates;

      if (remote_data) {
        const remote_array_data: UnifiedCandidateOutput[] = await Promise.all(
          res.map(async (candidate) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: candidate.id },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...candidate, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.candidate.pull',
          method: 'GET',
          url: '/ats/candidates',
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
