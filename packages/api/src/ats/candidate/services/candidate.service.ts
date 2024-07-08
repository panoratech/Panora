import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICandidateService } from '../types';
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
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
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: { id_linked_user: linkedUserId },
      });

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

      const existingCandidate = await this.prisma.ats_candidates.findFirst({
        where: {
          remote_id: target_candidate.remote_id,
          id_connection: connection_id,
        },
      });

      let unique_ats_candidate_id: string;

      if (existingCandidate) {
        const data: any = {
          first_name: target_candidate.first_name,
          last_name: target_candidate.last_name,
          company: target_candidate.company,
          title: target_candidate.title,
          remote_created_at: target_candidate.remote_created_at,
          remote_modified_at: target_candidate.remote_modified_at,
          last_interaction_at: target_candidate.last_interaction_at,
          is_private: target_candidate.is_private,
          email_reachable: target_candidate.email_reachable,
          locations: target_candidate.locations,
          modified_at: new Date(),
        };

        const res = await this.prisma.ats_candidates.update({
          where: { id_ats_candidate: existingCandidate.id_ats_candidate },
          data: data,
        });

        unique_ats_candidate_id = res.id_ats_candidate;
      } else {
        const data: any = {
          id_ats_candidate: uuidv4(),
          first_name: target_candidate.first_name,
          last_name: target_candidate.last_name,
          company: target_candidate.company,
          title: target_candidate.title,
          remote_created_at: target_candidate.remote_created_at,
          remote_modified_at: target_candidate.remote_modified_at,
          last_interaction_at: target_candidate.last_interaction_at,
          is_private: target_candidate.is_private,
          email_reachable: target_candidate.email_reachable,
          locations: target_candidate.locations,
          created_at: new Date(),
          modified_at: new Date(),
          remote_id: target_candidate.remote_id,
          id_connection: connection_id,
        };

        const newCandidate = await this.prisma.ats_candidates.create({
          data: data,
        });

        unique_ats_candidate_id = newCandidate.id_ats_candidate;
      }

      //update related objects

      /* tags / emails / numbers are synced inside their own services from remote parties
      for (const tag of target_candidate.tags) {
        await this.prisma.ats_candidate_tags.upsert({
          where: {
            id_ats_candidate: unique_ats_candidate_id,
          },
          update: {
            name: tag,
            modified_at: new Date(),
          },
          create: {
            id_ats_candidate: unique_ats_candidate_id,
            name: tag,
            created_at: new Date(),
            modified_at: new Date(),
          },
        });
      }
      */

      if (
        target_candidate.field_mappings &&
        target_candidate.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_ats_candidate_id,
            created_at: new Date(),
            modified_at: new Date(),
          },
        });

        for (const [slug, value] of Object.entries(
          target_candidate.field_mappings,
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
                created_at: new Date(),
                modified_at: new Date(),
                entity: { connect: { id_entity: entity.id_entity } },
              },
            });
          }
        }
      }

      await this.prisma.remote_data.upsert({
        where: { ressource_owner_id: unique_ats_candidate_id },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ats_candidate_id,
          format: 'json',
          data: JSON.stringify(source_candidate),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_candidate),
          created_at: new Date(),
        },
      });

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

  async updateCandidate(
    id: string,
    updateCandidateData: Partial<UnifiedCandidateInput>,
  ): Promise<UnifiedCandidateOutput> {
    try {
    } catch (error) {}
    return;
  }
}
