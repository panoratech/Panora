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
import { IBaseSync } from '@@core/utils/types/interface';
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
  async syncCandidates(user_id?: string) {
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
                    await this.syncCandidatesForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                    );
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

  async syncCandidatesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} candidates for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ats',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping candidates syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.candidate',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ICandidateService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalCandidateOutput[]> =
        await service.syncCandidates(linkedUserId, remoteProperties);

      const sourceObject: OriginalCandidateOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedCandidateOutput,
        OriginalCandidateOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'ats',
        'candidate',
        customFieldMappings,
      );
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
      let candidates_results: AtsCandidate[] = [];
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const originId = candidate.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingCandidate = await this.prisma.ats_candidates.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_candidate_id: string;

        const { normalizedEmails, normalizedPhones } =
          this.utils.normalizeEmailsAndNumbers(
            candidate.email_addresses,
            candidate.phone_numbers,
          );
        const normalizedUrls = this.utils.normalizeUrls(candidate.urls);

        if (existingCandidate) {
          // Update the existing candidate
          let data: any = {
            modified_at: new Date(),
          };
          if (candidate.first_name) {
            data = { ...data, first_name: candidate.first_name };
          }
          if (candidate.last_name) {
            data = { ...data, last_name: candidate.last_name };
          }
          if (candidate.company) {
            data = { ...data, company: candidate.company };
          }
          if (candidate.title) {
            data = { ...data, title: candidate.title };
          }
          if (candidate.locations) {
            data = { ...data, locations: candidate.locations };
          }
          if (candidate.is_private) {
            data = { ...data, is_private: candidate.is_private };
          }
          if (candidate.email_reachable) {
            data = { ...data, email_reachable: candidate.email_reachable };
          }
          if (candidate.remote_created_at) {
            data = { ...data, remote_created_at: candidate.remote_created_at };
          }
          if (candidate.remote_modified_at) {
            data = {
              ...data,
              remote_modified_at: candidate.remote_modified_at,
            };
          }
          if (candidate.last_interaction_at) {
            data = {
              ...data,
              last_interaction_at: candidate.last_interaction_at,
            };
          }
          const res = await this.prisma.ats_candidates.update({
            where: {
              id_ats_candidate: existingCandidate.id_ats_candidate,
            },
            data: data,
          });
          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map(async (email) => {
                const a =
                  await this.prisma.ats_candidate_email_addresses.findFirst({
                    where: {
                      id_ats_candidate: res.id_ats_candidate,
                      value: email.value,
                    },
                  });
                if (a) {
                  this.prisma.ats_candidate_email_addresses.update({
                    where: {
                      id_ats_candidate_email_address:
                        a.id_ats_candidate_email_address,
                    },
                    data: {
                      ...email,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                } else {
                  this.prisma.ats_candidate_email_addresses.create({
                    data: {
                      ...email,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                }
              }),
            );
          }
          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map(async (phone) => {
                const a =
                  await this.prisma.ats_candidate_phone_numbers.findFirst({
                    where: {
                      id_ats_candidate: res.id_ats_candidate,
                      value: phone.value,
                    },
                  });
                if (a) {
                  this.prisma.ats_candidate_phone_numbers.update({
                    where: {
                      id_ats_candidate_phone_number:
                        a.id_ats_candidate_phone_number,
                    },
                    data: {
                      ...phone,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                } else {
                  this.prisma.ats_candidate_phone_numbers.create({
                    data: {
                      ...phone,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                }
              }),
            );
          }
          if (normalizedUrls && normalizedUrls.length > 0) {
            await Promise.all(
              normalizedUrls.map(async (url) => {
                const a = await this.prisma.ats_candidate_urls.findFirst({
                  where: {
                    id_ats_candidate: res.id_ats_candidate,
                    value: url.value,
                  },
                });
                if (a) {
                  this.prisma.ats_candidate_urls.update({
                    where: {
                      id_ats_candidate_url: a.id_ats_candidate_url,
                    },
                    data: {
                      ...url,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                } else {
                  this.prisma.ats_candidate_urls.create({
                    data: {
                      ...url,
                      id_ats_candidate: res.id_ats_candidate,
                    },
                  });
                }
              }),
            );
          }
          unique_ats_candidate_id = res.id_ats_candidate;
          candidates_results = [...candidates_results, res];
        } else {
          // Create a new candidate
          this.logger.log('Candidate does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_candidate: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (candidate.first_name) {
            data = { ...data, first_name: candidate.first_name };
          }
          if (candidate.last_name) {
            data = { ...data, last_name: candidate.last_name };
          }
          if (candidate.company) {
            data = { ...data, company: candidate.company };
          }
          if (candidate.title) {
            data = { ...data, title: candidate.title };
          }
          if (candidate.locations) {
            data = { ...data, locations: candidate.locations };
          }
          if (candidate.is_private) {
            data = { ...data, is_private: candidate.is_private };
          }
          if (candidate.email_reachable) {
            data = { ...data, email_reachable: candidate.email_reachable };
          }
          if (candidate.remote_created_at) {
            data = { ...data, remote_created_at: candidate.remote_created_at };
          }
          if (candidate.remote_modified_at) {
            data = {
              ...data,
              remote_modified_at: candidate.remote_modified_at,
            };
          }
          if (candidate.last_interaction_at) {
            data = {
              ...data,
              last_interaction_at: candidate.last_interaction_at,
            };
          }

          const newCandidate = await this.prisma.ats_candidates.create({
            data: data,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email) =>
                this.prisma.ats_candidate_email_addresses.create({
                  data: {
                    ...email,
                    id_ats_candidate: newCandidate.id_ats_candidate,
                  },
                }),
              ),
            );
          }

          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map((phone) =>
                this.prisma.ats_candidate_phone_numbers.create({
                  data: {
                    ...phone,
                    id_ats_candidate: newCandidate.id_ats_candidate,
                  },
                }),
              ),
            );
          }

          if (normalizedUrls && normalizedUrls.length > 0) {
            await Promise.all(
              normalizedUrls.map((url) =>
                this.prisma.ats_candidate_urls.create({
                  data: {
                    ...url,
                    id_ats_candidate: newCandidate.id_ats_candidate,
                  },
                }),
              ),
            );
          }

          unique_ats_candidate_id = newCandidate.id_ats_candidate;
          candidates_results = [...candidates_results, newCandidate];
        }

        // now insert the attachment of the candidate inside ats_candidate_attachments
        if (candidate.attachments) {
          await this.registry.getService('ats', 'attachment').saveToDb(
            connection_id,
            linkedUserId,
            candidate.attachments,
            originSource,
            candidate.attachments.map((att: UnifiedAttachmentOutput) => {
              return att.remote_data;
            }),
            {
              candidate_id: unique_ats_candidate_id,
            },
          );
        }

        // insert tag inside db
        if (candidate.tags) {
          const tags = await this.registry.getService('ats', 'tag').saveToDb(
            connection_id,
            linkedUserId,
            candidate.tags,
            originSource,
            candidate.tags.map((tag: UnifiedTagOutput) => {
              return tag.remote_data;
            }),
          );
          await this.prisma.ats_candidates.update({
            where: {
              id_ats_candidate: unique_ats_candidate_id,
            },
            data: {
              tags: tags.map((tag) => tag.id_tcg_tag as string),
            },
          });
        }

        // check duplicate or existing values
        if (candidate.field_mappings && candidate.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_candidate_id,
            },
          });

          for (const [slug, value] of Object.entries(
            candidate.field_mappings,
          )) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: value || 'null',
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

        // insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ats_candidate_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_candidate_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return candidates_results;
    } catch (error) {
      throw error;
    }
  }
}
