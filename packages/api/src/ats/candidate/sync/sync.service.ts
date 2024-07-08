import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { ICandidateService } from '../types';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedCandidateOutput } from '../types/model.unified';
import { ats_candidates as AtsCandidate } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { UnifiedAttachmentOutput } from '@ats/attachment/types/model.unified';
import { UnifiedTagOutput } from '@ats/tag/types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
    private utils: Utils,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'candidate', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-candidates',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing candidates...');
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = ATS_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncForLinkedUser({
                      integrationId: provider,
                      linkedUserId: linkedUser.id_linked_user,
                    });
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ICandidateService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedCandidateOutput,
        OriginalCandidateOutput,
        ICandidateService
      >(integrationId, linkedUserId, 'ats', 'candidate', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    candidates: UnifiedCandidateOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsCandidate[]> {
    try {
      const candidates_results: AtsCandidate[] = [];
      const updateOrCreateEmails = async (
        candidateId: string,
        emails: any[],
      ) => {
        if (emails && emails.length > 0) {
          await Promise.all(
            emails.map(async (email) => {
              const existingEmail =
                await this.prisma.ats_candidate_email_addresses.findFirst({
                  where: {
                    id_ats_candidate: candidateId,
                    value: email.value,
                  },
                });
              if (existingEmail) {
                await this.prisma.ats_candidate_email_addresses.update({
                  where: {
                    id_ats_candidate_email_address:
                      existingEmail.id_ats_candidate_email_address,
                  },
                  data: {
                    ...email,
                    id_ats_candidate: candidateId,
                  },
                });
              } else {
                await this.prisma.ats_candidate_email_addresses.create({
                  data: {
                    ...email,
                    id_ats_candidate: candidateId,
                  },
                });
              }
            }),
          );
        }
      };

      const updateOrCreatePhones = async (
        candidateId: string,
        phones: any[],
      ) => {
        if (phones && phones.length > 0) {
          await Promise.all(
            phones.map(async (phone) => {
              const existingPhone =
                await this.prisma.ats_candidate_phone_numbers.findFirst({
                  where: {
                    id_ats_candidate: candidateId,
                    value: phone.value,
                  },
                });
              if (existingPhone) {
                await this.prisma.ats_candidate_phone_numbers.update({
                  where: {
                    id_ats_candidate_phone_number:
                      existingPhone.id_ats_candidate_phone_number,
                  },
                  data: {
                    ...phone,
                    id_ats_candidate: candidateId,
                  },
                });
              } else {
                await this.prisma.ats_candidate_phone_numbers.create({
                  data: {
                    ...phone,
                    id_ats_candidate: candidateId,
                  },
                });
              }
            }),
          );
        }
      };

      const updateOrCreateUrls = async (candidateId: string, urls: any[]) => {
        if (urls && urls.length > 0) {
          await Promise.all(
            urls.map(async (url) => {
              const existingUrl =
                await this.prisma.ats_candidate_urls.findFirst({
                  where: {
                    id_ats_candidate: candidateId,
                    value: url.value,
                  },
                });
              if (existingUrl) {
                await this.prisma.ats_candidate_urls.update({
                  where: {
                    id_ats_candidate_url: existingUrl.id_ats_candidate_url,
                  },
                  data: {
                    ...url,
                    id_ats_candidate: candidateId,
                  },
                });
              } else {
                await this.prisma.ats_candidate_urls.create({
                  data: {
                    ...url,
                    id_ats_candidate: candidateId,
                  },
                });
              }
            }),
          );
        }
      };

      const updateOrCreateCandidate = async (
        candidate: UnifiedCandidateOutput,
        originId: string,
      ) => {
        const existingCandidate = await this.prisma.ats_candidates.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const { normalizedEmails, normalizedPhones } =
          this.utils.normalizeEmailsAndNumbers(
            candidate.email_addresses,
            candidate.phone_numbers,
          );
        const normalizedUrls = this.utils.normalizeUrls(candidate.urls);

        const baseData: any = {
          first_name: candidate.first_name ?? null,
          last_name: candidate.last_name ?? null,
          company: candidate.company ?? null,
          title: candidate.title ?? null,
          locations: candidate.locations ?? null,
          is_private: candidate.is_private ?? null,
          email_reachable: candidate.email_reachable ?? null,
          remote_created_at: candidate.remote_created_at ?? null,
          remote_modified_at: candidate.remote_modified_at ?? null,
          last_interaction_at: candidate.last_interaction_at ?? null,
          modified_at: new Date(),
        };

        let res;
        if (existingCandidate) {
          res = await this.prisma.ats_candidates.update({
            where: {
              id_ats_candidate: existingCandidate.id_ats_candidate,
            },
            data: baseData,
          });
        } else {
          res = await this.prisma.ats_candidates.create({
            data: {
              ...baseData,
              id_ats_candidate: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const candidateId = res.id_ats_candidate;

        await updateOrCreateEmails(candidateId, normalizedEmails);
        await updateOrCreatePhones(candidateId, normalizedPhones);
        await updateOrCreateUrls(candidateId, normalizedUrls);

        return res;
      };

      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const originId = candidate.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateCandidate(candidate, originId);
        const candidate_id = res.id_ats_candidate;
        candidates_results.push(res);

        // Process attachments
        if (candidate.attachments) {
          await this.registry.getService('ats', 'attachment').saveToDb(
            connection_id,
            linkedUserId,
            candidate.attachments,
            originSource,
            candidate.attachments.map(
              (att: UnifiedAttachmentOutput) => att.remote_data,
            ),
            { candidate_id },
          );
        }

        // Process tags
        if (candidate.tags) {
          const tags = await this.registry.getService('ats', 'tag').saveToDb(
            connection_id,
            linkedUserId,
            candidate.tags,
            originSource,
            candidate.tags.map((tag: UnifiedTagOutput) => tag.remote_data),
          );
          await this.prisma.ats_candidates.update({
            where: {
              id_ats_candidate: candidate_id,
            },
            data: {
              tags: tags.map((tag) => tag.id_tcg_tag as string),
            },
          });
        }

        // Process field mappings
        await this.ingestService.processFieldMappings(
          candidate.field_mappings,
          candidate_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          candidate_id,
          remote_data[i],
        );
      }

      return candidates_results;
    } catch (error) {
      throw error;
    }
  }
}
