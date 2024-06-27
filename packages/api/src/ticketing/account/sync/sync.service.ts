import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync } from '@@core/utils/types/interface';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_accounts as TicketingAccount } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IAccountService } from '../types';
import { UnifiedAccountOutput } from '../types/model.unified';

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
    this.registry.registerService('ticketing', 'account', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ticketing-sync-accounts',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
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
              connection.id_connection,
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

      await this.ingestService.ingestData<
        UnifiedAccountOutput,
        OriginalAccountOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'ticketing',
        'account',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedAccountOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAccount[]> {
    try {
      let accounts_results: TicketingAccount[] = [];
      for (let i = 0; i < data.length; i++) {
        const account = data[i];
        const originId = account.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingAccount = await this.prisma.tcg_accounts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
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
            remote_id: originId,
            id_connection: connection_id,
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

  async removeAccountInDb(connection_id: string, remote_id: string) {
    const existingAccount = await this.prisma.tcg_accounts.findFirst({
      where: {
        remote_id: remote_id,
        id_connection: connection_id,
      },
    });
    await this.prisma.tcg_accounts.delete({
      where: {
        id_tcg_account: existingAccount.id_tcg_account,
      },
    });
  }
}
