import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedAccountOutput } from '../types/model.unified';
import { IAccountService } from '../types';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { tcg_accounts as TicketingAccount } from '@prisma/client';

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
      await this.syncAccounts();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our tcg_accounts table
  //its role is to fetch all accounts from providers 3rd parties and save the info inside our db
  async syncAccounts() {
    try {
      this.logger.log(`Syncing accounts....`);
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
      const linkedAccounts = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedAccounts.map(async (linkedAccount) => {
        try {
          const providers = TICKETING_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncAccountsForLinkedAccount(
                provider,
                linkedAccount.id_linked_user,
                id_project,
              );
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
  async syncAccountsForLinkedAccount(
    integrationId: string,
    linkedAccountId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} accounts for linkedAccount ${linkedAccountId}`,
      );
      // check if linkedAccount has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedAccountId,
          provider_slug: integrationId,
        },
      });
      if (!connection) return;
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.account.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedAccountId,
        },
      });
      const job_id = job_resp_create.id_event;

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedAccountId,
          'account',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IAccountService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalAccountOutput[]> =
        await service.syncAccounts(linkedAccountId, remoteProperties);

      const sourceObject: OriginalAccountOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalAccountOutput[]>({
        sourceObject,
        targetType: TicketingObject.account,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedAccountOutput[];

      //TODO
      const accountIds = sourceObject.map((account) =>
        'id' in account ? String(account.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const account_data = await this.saveAccountsInDb(
        linkedAccountId,
        unifiedObject,
        accountIds,
        integrationId,
        job_id,
        sourceObject,
      );
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });
      await this.webhook.handleWebhook(
        account_data,
        'ticketing.account.pulled',
        id_project,
        job_id,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveAccountsInDb(
    linkedAccountId: string,
    accounts: UnifiedAccountOutput[],
    originIds: string[],
    originSource: string,
    jobId: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAccount[]> {
    try {
      let accounts_results: TicketingAccount[] = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingAccount = await this.prisma.tcg_accounts.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            events: {
              id_linked_account: linkedAccountId,
            },
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
            id_event: jobId,
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

          for (const mapping of account.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedAccountId,
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
      handleServiceError(error, this.logger);
    }
  }
}
