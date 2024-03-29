import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CRM_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { CrmObject } from '@crm/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedEngagementOutput } from '../types/model.unified';
import { IEngagementService } from '../types';
import { crm_engagements as CrmEngagement } from '@prisma/client';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { ENGAGEMENTS_TYPE } from '../utils';

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
      //TODO: to test after
      //await this.syncEngagements();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_engagements table
  //its role is to fetch all engagements from providers 3rd parties and save the info inside our db
  async syncEngagements() {
    try {
      this.logger.log(`Syncing engagements....`);
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
              for (const type of ENGAGEMENTS_TYPE) {
                await this.syncEngagementsForLinkedUser(
                  provider,
                  linkedUser.id_linked_user,
                  id_project,
                  type,
                );
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
  async syncEngagementsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    engagement_type: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} engagements for linkedUser ${linkedUserId}`,
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
          `Skipping engagements syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.engagement',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IEngagementService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalEngagementOutput[]> =
        await service.syncEngagements(
          linkedUserId,
          engagement_type,
          remoteProperties,
        );

      const sourceObject: OriginalEngagementOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalEngagementOutput[]>({
        sourceObject,
        targetType: CrmObject.engagement,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedEngagementOutput[];



      //insert the data in the DB with the fieldMappings (value table)
      const engagements_data = await this.saveEngagementsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.engagement.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        engagements_data,
        'crm.engagement.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveEngagementsInDb(
    linkedUserId: string,
    engagements: UnifiedEngagementOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmEngagement[]> {
    try {
      let engagements_results: CrmEngagement[] = [];
      for (let i = 0; i < engagements.length; i++) {
        const engagement = engagements[i];
        const originId = engagement.remote_id;

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingEngagement = await this.prisma.crm_engagements.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_crm_engagement_id: string;

        if (existingEngagement) {
          // Update the existing engagement
          let data: any = {
            modified_at: new Date(),
          };

          if (engagement.content) {
            data = { ...data, content: engagement.content };
          }
          if (engagement.direction) {
            data = { ...data, direction: engagement.direction };
          }
          if (engagement.subject) {
            data = { ...data, subject: engagement.subject };
          }
          if (engagement.start_at) {
            data = { ...data, start_at: engagement.start_at };
          }
          if (engagement.end_time) {
            data = { ...data, end_time: engagement.end_time };
          }
          if (engagement.type) {
            data = {
              ...data,
              type: engagement.type,
            };
          }
          if (engagement.company_id) {
            data = { ...data, id_crm_company: engagement.company_id };
          }

          /*TODO:
          if (engagement.contacts) {
            data = { ...data, end_time: engagement.end_time };
          }*/
          const res = await this.prisma.crm_engagements.update({
            where: {
              id_crm_engagement: existingEngagement.id_crm_engagement,
            },
            data: data,
          });
          unique_crm_engagement_id = res.id_crm_engagement;
          engagements_results = [...engagements_results, res];
        } else {
          // Create a new engagement
          this.logger.log('engagement not exists');
          let data: any = {
            id_crm_engagement: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (engagement.content) {
            data = { ...data, content: engagement.content };
          }
          if (engagement.direction) {
            data = { ...data, direction: engagement.direction };
          }
          if (engagement.subject) {
            data = { ...data, subject: engagement.subject };
          }
          if (engagement.start_at) {
            data = { ...data, start_at: engagement.start_at };
          }
          if (engagement.end_time) {
            data = { ...data, end_time: engagement.end_time };
          }
          if (engagement.type) {
            data = {
              ...data,
              type: engagement.type,
            };
          }
          if (engagement.company_id) {
            data = { ...data, id_crm_company: engagement.company_id };
          }

          /*TODO:
          if (engagement.contacts) {
            data = { ...data, end_time: engagement.end_time };
          }*/

          const res = await this.prisma.crm_engagements.create({
            data: data,
          });
          unique_crm_engagement_id = res.id_crm_engagement;
          engagements_results = [...engagements_results, res];
        }

        // check duplicate or existing values
        if (engagement.field_mappings && engagement.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_engagement_id,
            },
          });

          for (const mapping of engagement.field_mappings) {
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
            ressource_owner_id: unique_crm_engagement_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_engagement_id,
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
      return engagements_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
