import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IDepartmentService } from '../types';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedDepartmentOutput } from '../types/model.unified';
import { ats_departments as AtsDepartment } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'department', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-departments',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncDepartments(user_id?: string) {
    try {
      this.logger.log('Syncing departments...');
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
                    await this.syncDepartmentsForLinkedUser(
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

  async syncDepartmentsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} departments for linkedUser ${linkedUserId}`,
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
          `Skipping departments syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.department',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IDepartmentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalDepartmentOutput[]> =
        await service.syncDepartments(linkedUserId, remoteProperties);

      const sourceObject: OriginalDepartmentOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedCompanyOutput,
        OriginalCompanyOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'crm',
        'company',
        customFieldMappings,
      );
      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalDepartmentOutput[]
      >({
        sourceObject,
        targetType: AtsObject.department,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedDepartmentOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const departments_data = await this.saveDepartmentsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.department.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        departments_data,
        'ats.department.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveDepartmentsInDb(
    linkedUserId: string,
    departments: UnifiedDepartmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsDepartment[]> {
    try {
      let departments_results: AtsDepartment[] = [];
      for (let i = 0; i < departments.length; i++) {
        const department = departments[i];
        const originId = department.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingDepartment = await this.prisma.ats_departments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_department_id: string;

        if (existingDepartment) {
          // Update the existing department
          let data: any = {
            modified_at: new Date(),
          };
          if (department.name) {
            data = { ...data, name: department.name };
          }
          const res = await this.prisma.ats_departments.update({
            where: {
              id_ats_department: existingDepartment.id_ats_department,
            },
            data: data,
          });
          unique_ats_department_id = res.id_ats_department;
          departments_results = [...departments_results, res];
        } else {
          // Create a new department
          this.logger.log('Department does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_department: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (department.name) {
            data = { ...data, name: department.name };
          }

          const newDepartment = await this.prisma.ats_departments.create({
            data: data,
          });

          unique_ats_department_id = newDepartment.id_ats_department;
          departments_results = [...departments_results, newDepartment];
        }

        // check duplicate or existing values
        if (department.field_mappings && department.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_department_id,
            },
          });

          for (const [slug, value] of Object.entries(
            department.field_mappings,
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
            ressource_owner_id: unique_ats_department_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_department_id,
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
      return departments_results;
    } catch (error) {
      throw error;
    }
  }
}
