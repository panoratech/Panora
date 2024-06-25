import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CoreUnification } from '@@core/utils/services/core.service';
import { ApiResponse } from '@@core/utils/types';
import { ICandidateService } from '../types';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedCandidateOutput } from '../types/model.unified';
import { ats_candidates as AtsCandidate } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ats-sync-candidates';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
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
                      id_project,
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
    id_project: string,
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
      const resp: ApiResponse<OriginalCandidateOutput[]> =
        await service.syncCandidates(linkedUserId, remoteProperties);

      const sourceObject: OriginalCandidateOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCandidateOutput[]
      >({
        sourceObject,
        targetType: AtsObject.candidate,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings,
      })) as UnifiedCandidateOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const candidates_data = await this.saveCandidatesInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.candidate.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        candidates_data,
        'ats.candidate.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveCandidatesInDb(
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
          if (candidate.is_private !== undefined) {
            data = { ...data, is_private: candidate.is_private };
          }
          if (candidate.email_reachable !== undefined) {
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
          if (candidate.is_private !== undefined) {
            data = { ...data, is_private: candidate.is_private };
          }
          if (candidate.email_reachable !== undefined) {
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

          unique_ats_candidate_id = newCandidate.id_ats_candidate;
          candidates_results = [...candidates_results, newCandidate];
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
