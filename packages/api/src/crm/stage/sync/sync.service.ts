import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';

import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedStageOutput } from '../types/model.unified';
import { IStageService } from '../types';
import { crm_deals_stages as CrmStage } from '@prisma/client';
import { OriginalStageOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

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
    const jobName = 'crm-sync-stages';

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
  //function used by sync worker which populate our crm_stages table
  //its role is to fetch all stages from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncStages(user_id?: string) {
    try {
      this.logger.log(`Syncing stages....`);
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
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
                for (const provider of providers) {
                  try {
                    try {
                      //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                      const deals = await this.prisma.crm_deals.findMany({
                        where: {
                          remote_platform: provider,
                          id_linked_user: linkedUser.id_linked_user,
                        },
                      });
                      for (const deal of deals) {
                        await this.syncStagesForLinkedUser(
                          provider,
                          linkedUser.id_linked_user,
                          id_project,
                          deal.id_crm_deal,
                        );
                      }
                    } catch (error) {
                      throw error;
                    }
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncStagesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    deal_id: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} stages for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'crm',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping stages syncing... No ${integrationId} connection was found for linked stage ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.stage',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IStageService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalStageOutput[]> = await service.syncStages(
        linkedUserId,
        deal_id,
        remoteProperties,
      );

      const sourceObject: OriginalStageOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalStageOutput[]
      >({
        sourceObject,
        targetType: CrmObject.stage,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings,
      })) as UnifiedStageOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const stages_data = await this.saveStagesInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        deal_id,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.stage.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        stages_data,
        'crm.stage.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveStagesInDb(
    linkedUserId: string,
    stages: UnifiedStageOutput[],
    originSource: string,
    deal_id: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmStage[]> {
    try {
      let stages_results: CrmStage[] = [];
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const originId = stage.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingStage = await this.prisma.crm_deals.findFirst({
          where: {
            id_crm_deal: deal_id,
          },
          select: {
            id_crm_deals_stage: true,
          },
        });

        let unique_crm_stage_id: string;

        if (existingStage.id_crm_deals_stage) {
          // Update the existing stage
          let data: any = {
            modified_at: new Date(),
          };

          if (stage.stage_name) {
            data = { ...data, stage_name: stage.stage_name };
          }

          const res = await this.prisma.crm_deals_stages.update({
            where: {
              id_crm_deals_stage: existingStage.id_crm_deals_stage,
            },
            data: data,
          });
          unique_crm_stage_id = res.id_crm_deals_stage;
          stages_results = [...stages_results, res];
        } else {
          // it doesnt mean the stage does not exist as we know that 1 stage can have multiple deals associated
          // so first we have to check if the stage exists or not inside our db
          // if it exists we just have to map its id to the crm_deals table otherwise we cretae a new entry in crmdeals_stage
          const isExistingStage = await this.prisma.crm_deals_stages.findFirst({
            where: {
              remote_id: originId,
              remote_platform: originSource,
            },
          });
          if (isExistingStage) {
            //we just have to update the crm_deals row by mapping it to its stage id
            this.logger.log('stage already exists, just mapping it');
            await this.prisma.crm_deals.update({
              where: {
                id_crm_deal: deal_id,
              },
              data: {
                id_crm_deals_stage: isExistingStage.id_crm_deals_stage,
              },
            });
            unique_crm_stage_id = isExistingStage.id_crm_deals_stage;
            stages_results = [...stages_results, isExistingStage];
          } else {
            this.logger.log('stage not exists');
            let data: any = {
              id_crm_deals_stage: uuidv4(),
              created_at: new Date(),
              modified_at: new Date(),
              id_linked_user: linkedUserId,
              remote_id: originId || '',
              remote_platform: originSource,
            };

            if (stage.stage_name) {
              data = { ...data, stage_name: stage.stage_name };
            }
            const res = await this.prisma.crm_deals_stages.create({
              data: data,
            });
            //now update the crm_deals table with the newly crated stage
            await this.prisma.crm_deals.update({
              where: {
                id_crm_deal: deal_id,
              },
              data: {
                id_crm_deals_stage: res.id_crm_deals_stage,
              },
            });
            unique_crm_stage_id = res.id_crm_deals_stage;
            stages_results = [...stages_results, res];
          }
        }

        // check duplicate or existing values
        if (stage.field_mappings && stage.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_stage_id,
            },
          });

          for (const [slug, value] of Object.entries(stage.field_mappings)) {
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

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_crm_stage_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_stage_id,
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
      return stages_results;
    } catch (error) {
      throw error;
    }
  }
}
