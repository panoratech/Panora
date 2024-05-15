import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, Pagination } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { IUserService } from '../types';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ticketing';
import { tcg_users as TicketingUser } from '@prisma/client';
import { UnifiedUserOutput } from '../types/model.unified';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly utils: Utils;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
    this.utils = new Utils();
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ticketing-sync-users';

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
  //function used by sync worker which populate our tcg_users table
  //its role is to fetch all users from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncUsers(user_id?: string) {
    try {
      this.logger.log(`Syncing users....`);
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
                const providers = TICKETING_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncUsersForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                      id_project,
                    );
                    this.logger.log(
                      `users sync completed for provider: ${provider} linked to user_id: ${linkedUser.id_linked_user}`,
                    );
                  } catch (error) {
                    handleServiceError(error, this.logger);
                  }
                }
              } catch (error) {
                handleServiceError(error, this.logger);
              }
            });
          }
        }
      }
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncUsersForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} users for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping users syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.user',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IUserService =
        this.serviceRegistry.getService(integrationId);
      const handleService = async (pageMeta?: Pagination) => {
        return await service.syncUsers(
          linkedUserId,
          remoteProperties,
          pageMeta,
        );
      };
      const handleSaveToDb = async (
        resp: ApiResponse<OriginalUserOutput[]>,
      ) => {
        const sourceObject = (resp?.data || []) as OriginalUserOutput[];
        //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
        //unify the data accordiGitLab may impose rate limits on API requests to prevent abuse or excessive load on their servers. Ensure that you're not hitting API endpoints too frequently or exceeding any rate limits imposed by GitLab. Consider implementing backoff strategies or exponential retry mechanisms to handle rate limiting gracefully.ng to the target obj wanted
        const unifiedObject = (await unify<OriginalUserOutput[]>({
          sourceObject,
          targetType: TicketingObject.user,
          providerName: integrationId,
          vertical: 'ticketing',
          customFieldMappings,
        })) as UnifiedUserOutput[];
        //insert the data in the DB with the fieldMappings (value table)
        const user_data = await this.saveUsersInDb(
          linkedUserId,
          unifiedObject,
          integrationId,
          sourceObject,
        );
        const event = await this.prisma.events.create({
          data: {
            id_event: uuidv4(),
            status: 'success',
            type: 'ticketing.user.pulled',
            method: 'PULL',
            url: '/pull',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
        await this.webhook.handleWebhook(
          user_data,
          'ticketing.user.pulled',
          id_project,
          event.id_event,
        );
      };
      await this.utils.fetchDataRecursively(handleService, handleSaveToDb, {
        isFirstPage: true,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveUsersInDb(
    linkedUserId: string,
    users: UnifiedUserOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingUser[]> {
    try {
      let users_results: TicketingUser[] = [];
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const originId = user.remote_id;

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingUser = await this.prisma.tcg_users.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_user_id: string;

        if (existingUser) {
          // Update the existing ticket
          const res = await this.prisma.tcg_users.update({
            where: {
              id_tcg_user: existingUser.id_tcg_user,
            },
            data: {
              name: user.name,
              email_address: user.email_address,
              teams: user.teams || [],
              modified_at: new Date(),
              //TODO: id_tcg_account: user.account_id || '',
            },
          });
          unique_ticketing_user_id = res.id_tcg_user;
          users_results = [...users_results, res];
        } else {
          // Create a new user
          // this.logger.log('not existing user ' + user.name);
          const data = {
            id_tcg_user: uuidv4(),
            name: user.name,
            email_address: user.email_address,
            teams: user.teams || [],
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            // id_tcg_account: user.account_id || '',
            remote_id: originId,
            remote_platform: originSource,
          };

          // console.log("Tcg user Data: ", data)
          const res = await this.prisma.tcg_users.create({
            data: data,
          });
          users_results = [...users_results, res];
          unique_ticketing_user_id = res.id_tcg_user;
        }

        // check duplicate or existing values
        if (user.field_mappings && user.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_user_id,
            },
          });

          for (const [slug, value] of Object.entries(user.field_mappings)) {
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
            ressource_owner_id: unique_ticketing_user_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_user_id,
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
      return users_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
