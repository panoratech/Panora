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
import { IScoreCardService } from '../types';
import { OriginalScoreCardOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedScoreCardOutput } from '../types/model.unified';
import { ats_scorecards as AtsScoreCard } from '@prisma/client';
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
    const jobName = 'ats-sync-score-cards';

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
  async syncScoreCards(user_id?: string) {
    try {
      this.logger.log('Syncing score cards...');
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
                    await this.syncScoreCardsForLinkedUser(
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

  async syncScoreCardsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} score cards for linkedUser ${linkedUserId}`,
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
          `Skipping score cards syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.score_card',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IScoreCardService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalScoreCardOutput[]> =
        await service.syncScoreCards(linkedUserId, remoteProperties);

      const sourceObject: OriginalScoreCardOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalScoreCardOutput[]
      >({
        sourceObject,
        targetType: AtsObject.scorecard,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings,
      })) as UnifiedScoreCardOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const scoreCards_data = await this.saveScoreCardsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.score_card.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        scoreCards_data,
        'ats.score_card.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveScoreCardsInDb(
    linkedUserId: string,
    scoreCards: UnifiedScoreCardOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsScoreCard[]> {
    try {
      let scoreCards_results: AtsScoreCard[] = [];
      for (let i = 0; i < scoreCards.length; i++) {
        const scoreCard = scoreCards[i];
        const originId = scoreCard.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingScoreCard = await this.prisma.ats_scorecards.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_score_card_id: string;

        if (existingScoreCard) {
          // Update the existing score card
          let data: any = {
            modified_at: new Date(),
          };
          if (scoreCard.overall_recommendation) {
            data = {
              ...data,
              overall_recommendation: scoreCard.overall_recommendation,
            };
          }
          if (scoreCard.application_id) {
            data = { ...data, application_id: scoreCard.application_id };
          }
          if (scoreCard.interview_id) {
            data = { ...data, interview_id: scoreCard.interview_id };
          }
          if (scoreCard.remote_created_at) {
            data = { ...data, remote_created_at: scoreCard.remote_created_at };
          }
          if (scoreCard.submitted_at) {
            data = { ...data, submitted_at: scoreCard.submitted_at };
          }
          const res = await this.prisma.ats_scorecards.update({
            where: {
              id_ats_scorecard: existingScoreCard.id_ats_scorecard,
            },
            data: data,
          });
          unique_ats_score_card_id = res.id_ats_scorecard;
          scoreCards_results = [...scoreCards_results, res];
        } else {
          // Create a new score card
          this.logger.log('Score card does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_score_card: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (scoreCard.overall_recommendation) {
            data = {
              ...data,
              overall_recommendation: scoreCard.overall_recommendation,
            };
          }
          if (scoreCard.application_id) {
            data = { ...data, application_id: scoreCard.application_id };
          }
          if (scoreCard.interview_id) {
            data = { ...data, interview_id: scoreCard.interview_id };
          }
          if (scoreCard.remote_created_at) {
            data = { ...data, remote_created_at: scoreCard.remote_created_at };
          }
          if (scoreCard.submitted_at) {
            data = { ...data, submitted_at: scoreCard.submitted_at };
          }

          const newScoreCard = await this.prisma.ats_scorecards.create({
            data: data,
          });

          unique_ats_score_card_id = newScoreCard.id_ats_scorecard;
          scoreCards_results = [...scoreCards_results, newScoreCard];
        }

        // check duplicate or existing values
        if (scoreCard.field_mappings && scoreCard.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_score_card_id,
            },
          });

          for (const [slug, value] of Object.entries(
            scoreCard.field_mappings,
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
            ressource_owner_id: unique_ats_score_card_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_score_card_id,
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
      return scoreCards_results;
    } catch (error) {
      throw error;
    }
  }
}
