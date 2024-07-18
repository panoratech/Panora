import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedProductOutput } from '../types/model.unified';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProductService.name);
  }

  async getProduct(
    id_ecommerce_product: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedProductOutput> {
    try {
      const product = await this.prisma.ecom_products.findUnique({
        where: {
          id_ecommerce_product: id_ecommerce_product,
        },
      });

      if (!product) {
        throw new Error(`Product with ID ${id_ecommerce_product} not found.`);
      }

      // Fetch field mappings for the product
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: product.id_ecommerce_product,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedProductOutput format
      const unifiedProduct: UnifiedProductOutput = {
        id: product.id_ecommerce_product,
        name: product.name,
        field_mappings: field_mappings,
        remote_id: product.remote_id,
        created_at: product.created_at,
        modified_at: product.modified_at,
      };

      let res: UnifiedProductOutput = unifiedProduct;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: product.id_ecommerce_product,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.product.pull',
          method: 'GET',
          url: '/ecommerce/product',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getProducts(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedProductOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ecom_products.findFirst({
          where: {
            id_connection: connection_id,
            id_ecommerce_product: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const products = await this.prisma.ecom_products.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ecommerce_product: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (products.length === limit + 1) {
        next_cursor = Buffer.from(
          products[products.length - 1].id_ecommerce_product,
        ).toString('base64');
        products.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedProducts: UnifiedProductOutput[] = await Promise.all(
        products.map(async (product) => {
          // Fetch field mappings for the product
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: product.id_ecommerce_product,
              },
            },
            include: {
              attribute: true,
            },
          });

          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedProductOutput format
          return {
            id: product.id_ecommerce_product,
            name: product.name,
            field_mappings: field_mappings,
            remote_id: product.remote_id,
            created_at: product.created_at,
            modified_at: product.modified_at,
          };
        }),
      );

      let res: UnifiedProductOutput[] = unifiedProducts;

      if (remote_data) {
        const remote_array_data: UnifiedProductOutput[] = await Promise.all(
          res.map(async (product) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: product.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...product, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.product.pull',
          method: 'GET',
          url: '/ecommerce/products',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
