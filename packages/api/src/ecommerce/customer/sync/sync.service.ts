import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalCustomerOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ICustomerService } from '../types';
import { UnifiedEcommerceCustomerOutput } from '../types/model.unified';
import { ECOMMERCE_PROVIDERS } from '@panora/shared';
import { ecom_customers as EcommerceCustomer } from '@prisma/client';
import { Utils } from '@ecommerce/@lib/@utils';

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
    private utils: Utils,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ecommerce', 'customer', this);
  }
  onModuleInit() {
//
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = ECOMMERCE_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ICustomerService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedEcommerceCustomerOutput,
        OriginalCustomerOutput,
        ICustomerService
      >(integrationId, linkedUserId, 'ecommerce', 'customer', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    customers: UnifiedEcommerceCustomerOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<EcommerceCustomer[]> {
    try {
      const customers_results: EcommerceCustomer[] = [];

      const updateOrCreateCustomer = async (
        customer: UnifiedEcommerceCustomerOutput,
        originId: string,
      ) => {
        let existingCustomer;
        if (!originId) {
          existingCustomer = await this.prisma.ecom_customers.findFirst({
            where: {
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              id_connection: connection_id,
            },
            include: {
              ecom_addresses: true,
            },
          });
        } else {
          existingCustomer = await this.prisma.ecom_customers.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
            include: {
              ecom_addresses: true,
            },
          });
        }

        const normalizedAddresses = this.utils.normalizeAddresses(
          customer.addresses,
        );

        const baseData: any = {
          email: customer.email ?? null,
          first_name: customer.first_name ?? null,
          last_name: customer.last_name ?? null,
          phone_number: customer.phone_number ?? null,
          modified_at: new Date(),
        };

        if (existingCustomer) {
          const res = await this.prisma.ecom_customers.update({
            where: {
              id_ecom_customer: existingCustomer.id_ecom_customer,
            },
            data: baseData,
          });
          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((data, index) => {
                if (
                  existingCustomer &&
                  existingCustomer.ecom_addresses[index]
                ) {
                  return this.prisma.ecom_addresses.update({
                    where: {
                      id_ecom_address:
                        existingCustomer.ecom_addresses[index].id_ecom_address,
                    },
                    data: data,
                  });
                } else {
                  console.log('data is ' + JSON.stringify(data));
                  return this.prisma.ecom_addresses.create({
                    data: {
                      ...data,
                      id_ecom_customer: existingCustomer.id_ecom_customer,
                      id_ecom_order: null,
                      remote_deleted: false,
                      //id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          return res;
        } else {
          const newCus = await this.prisma.ecom_customers.create({
            data: {
              ...baseData,
              id_ecom_customer: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              remote_deleted: false,
              id_connection: connection_id,
            },
          });

          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((data) => {
                this.prisma.ecom_addresses.create({
                  data: {
                    ...data,
                    id_ecom_customer: newCus.id_ecom_customer,
                    id_ecom_order: '',
                    remote_deleted: false,
                    //todo: id_connection: connection_id,
                  },
                });
              }),
            );
          }

          return newCus;
        }
      };

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        const originId = customer.remote_id;

        const res = await updateOrCreateCustomer(customer, originId);
        const customer_id = res.id_ecom_customer;
        customers_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          customer.field_mappings,
          customer_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(customer_id, remote_data[i]);
      }

      return customers_results;
    } catch (error) {
      throw error;
    }
  }
}
