import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { SyncError, throwTypedError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedAccountOutput } from '../types/model.unified';
import { IAccountService } from '../types';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { tcg_accounts as TicketingAccount } from '@prisma/client';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
    const jobName = 'ticketing-sync-accounts';

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
  //function used by sync worker which populate our tcg_accounts table
  //its role is to fetch all accounts from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncAccounts(user_id?: string) {
    try {
      this.logger.log(`Syncing accounts....`);
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
                    await this.syncAccountsForLinkedUser(
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncAccountsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    wh_real_time_trigger?: {
      action: 'UPDATE' | 'DELETE';
      data: {
        remote_id: string;
      };
    },
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} accounts for linkedAccount ${linkedUserId}`,
      );
      // check if linkedAccount has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping accounts syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.account',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IAccountService =
        this.serviceRegistry.getService(integrationId);

      let resp: ApiResponse<OriginalAccountOutput[]>;
      if (wh_real_time_trigger && wh_real_time_trigger.data.remote_id) {
        //meaning the call has been from a real time webhook that received data from a 3rd party
        switch (wh_real_time_trigger.action) {
          case 'DELETE':
            return await this.removeAccountInDb(
              linkedUserId,
              integrationId,
              wh_real_time_trigger.data.remote_id,
            );
          default:
            resp = await service.syncAccounts(
              linkedUserId,
              wh_real_time_trigger.data.remote_id,
              remoteProperties,
            );
            break;
        }
      } else {
        resp = await service.syncAccounts(
          linkedUserId,
          undefined,
          remoteProperties,
        );
      }

      const sourceObject: OriginalAccountOutput[] = resp.data;
      // this.logger.log('resp is ' + sourceObject);

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalAccountOutput[]
      >({
        sourceObject,
        targetType: TicketingObject.account,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings,
      })) as UnifiedAccountOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const account_data = await this.saveAccountsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.account.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        account_data,
        'ticketing.account.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveAccountsInDb(
    linkedUserId: string,
    accounts: UnifiedAccountOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAccount[]> {
    try {
      let accounts_results: TicketingAccount[] = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const originId = account.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingAccount = await this.prisma.tcg_accounts.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_account_id: string;

        if (existingAccount) {
          // Update the existing ticket
          const res = await this.prisma.tcg_accounts.update({
            where: {
              id_tcg_account: existingAccount.id_tcg_account,
            },
            data: {
              name: existingAccount.name,
              domains: existingAccount.domains,
              modified_at: new Date(),
            },
          });
          unique_ticketing_account_id = res.id_tcg_account;
          accounts_results = [...accounts_results, res];
        } else {
          // Create a new account
          this.logger.log('not existing account ' + account.name);
          const data = {
            id_tcg_account: uuidv4(),
            name: account.name,
            domains: account.domains,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          const res = await this.prisma.tcg_accounts.create({
            data: data,
          });
          accounts_results = [...accounts_results, res];
          unique_ticketing_account_id = res.id_tcg_account;
        }

        // check duplicate or existing values
        if (account.field_mappings && account.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_account_id,
            },
          });

          for (const [slug, value] of Object.entries(account.field_mappings)) {
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
            ressource_owner_id: unique_ticketing_account_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_account_id,
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
      return accounts_results;
    } catch (error) {
      throw error;
    }
  }

  async removeAccountInDb(
    linkedUserId: string,
    originSource: string,
    remote_id: string,
  ) {
    const existingAccount = await this.prisma.tcg_accounts.findFirst({
      where: {
        remote_id: remote_id,
        remote_platform: originSource,
        id_linked_user: linkedUserId,
      },
    });
    await this.prisma.tcg_accounts.delete({
      where: {
        id_tcg_account: existingAccount.id_tcg_account,
      },
    });
  }
}
