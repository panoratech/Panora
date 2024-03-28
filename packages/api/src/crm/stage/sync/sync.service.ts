import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { CrmObject } from '@crm/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedStageOutput } from '../types/model.unified';
import { IStageService } from '../types';
import { crm_deals_stages as CrmStage } from '@prisma/client';
import { OriginalStageOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.syncStages();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_stages table
  //its role is to fetch all stages from providers 3rd parties and save the info inside our db
  async syncStages() {
    try {
      this.logger.log(`Syncing stages....`);
      const defaultOrg = await this.prisma.organizations.findFirst({
        where: {
          name: 'Acme Inc',
        },
      });

      const defaultProject = await this.prisma.projects.findFirst({
        where: {
          id_organization: defaultOrg.id_organization,
          name: 'Project 1',
        },
      });
      const id_project = defaultProject.id_project;
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = CRM_PROVIDERS.filter(
            (provider) => provider !== 'zoho' && provider !== 'freshsales',
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
                handleServiceError(error, this.logger);
              }
            } catch (error) {
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
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
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping stages syncing... No ${integrationId} connection was found for linked stage ${linkedUserId} `,
        );
        return;
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
      const unifiedObject = (await unify<OriginalStageOutput[]>({
        sourceObject,
        targetType: CrmObject.stage,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedStageOutput[];

      //TODO
      const stageIds = sourceObject.map((stage) =>
        'id' in stage ? String(stage.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const stages_data = await this.saveStagesInDb(
        linkedUserId,
        unifiedObject,
        stageIds,
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
      handleServiceError(error, this.logger);
    }
  }

  async saveStagesInDb(
    linkedUserId: string,
    stages: UnifiedStageOutput[],
    originIds: string[],
    originSource: string,
    deal_id: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmStage[]> {
    try {
      let stages_results: CrmStage[] = [];
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
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

          for (const mapping of stage.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: Object.values(mapping)[0]
                    ? Object.values(mapping)[0]
                    : 'null',
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
      handleServiceError(error, this.logger);
    }
  }
}
