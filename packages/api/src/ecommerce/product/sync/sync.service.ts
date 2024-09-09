import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalProductOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ECOMMERCE_PROVIDERS } from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IProductService } from '../types';
import { UnifiedEcommerceProductOutput } from '../types/model.unified';
import { ecom_products as EcommerceProduct } from '@prisma/client';
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
    this.registry.registerService('ecommerce', 'product', this);
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
      const service: IProductService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedEcommerceProductOutput,
        OriginalProductOutput,
        IProductService
      >(integrationId, linkedUserId, 'ecommerce', 'product', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    products: UnifiedEcommerceProductOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<EcommerceProduct[]> {
    try {
      const products_results: EcommerceProduct[] = [];

      const updateOrCreateProduct = async (
        product: UnifiedEcommerceProductOutput,
        originId: string,
      ) => {
        let existingProduct;
        if (!originId) {
          existingProduct = await this.prisma.ecom_products.findFirst({
            where: {
              product_url: product.product_url,
              id_connection: connection_id,
            },
            include: {
              ecom_product_variants: true,
            },
          });
        } else {
          existingProduct = await this.prisma.ecom_products.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
            include: {
              ecom_product_variants: true,
            },
          });
        }

        const normalizedVariants = this.utils.normalizeVariants(
          product.variants,
        );

        const baseData: any = {
          product_url: product.product_url ?? null,
          product_type: product.product_type ?? null,
          product_status: product.product_status ?? null,
          images_urls: product.images_urls ?? [],
          description: product.description ?? null,
          vendor: product.vendor ?? null,
          tags: product.tags ?? [],
          modified_at: new Date(),
        };

        if (existingProduct) {
          const res = await this.prisma.ecom_products.update({
            where: {
              id_ecom_product: existingProduct.id_ecom_product,
            },
            data: baseData,
          });
          if (normalizedVariants && normalizedVariants.length > 0) {
            await Promise.all(
              normalizedVariants.map((data, index) => {
                if (
                  existingProduct &&
                  existingProduct.ecom_product_variants[index]
                ) {
                  return this.prisma.ecom_product_variants.update({
                    where: {
                      id_ecom_product_variant:
                        existingProduct.ecom_product_variants[index]
                          .id_ecom_product_variant,
                    },
                    data: data,
                  });
                } else {
                  return this.prisma.ecom_product_variants.create({
                    data: {
                      ...data,
                      remote_deleted: false,
                      id_ecom_product: existingProduct.id_ecom_product,
                      id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          return res;
        } else {
          const newProd = await this.prisma.ecom_products.create({
            data: {
              ...baseData,
              id_ecom_product: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              remote_deleted: false,
              id_connection: connection_id,
            },
          });

          if (normalizedVariants && normalizedVariants.length > 0) {
            await Promise.all(
              normalizedVariants.map((data) =>
                this.prisma.ecom_product_variants.create({
                  data: {
                    ...data,
                    remote_deleted: false,
                    id_ecom_product: newProd.id_ecom_product,
                    id_connection: connection_id,
                  },
                }),
              ),
            );
          }

          return newProd;
        }
      };

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const originId = product.remote_id;

        const res = await updateOrCreateProduct(product, originId);
        const product_id = res.id_ecom_product;
        products_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          product.field_mappings,
          product_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(product_id, remote_data[i]);
      }

      return products_results;
    } catch (error) {
      throw error;
    }
  }
}
