import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedEcommerceCustomerOutput } from '../types/model.unified';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(CustomerService.name);
  }

  async getCustomer(
    id_ecommerce_customer: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceCustomerOutput> {
    try {
      const customer = await this.prisma.ecom_customers.findUnique({
        where: {
          id_ecom_customer: id_ecommerce_customer,
        },
        include: {
          ecom_addresses: true,
        },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${id_ecommerce_customer} not found.`);
      }

      // Fetch field mappings for the customer
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: customer.id_ecom_customer,
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedEcommerceCustomerOutput format
      const UnifiedEcommerceCustomer: UnifiedEcommerceCustomerOutput = {
        id: customer.id_ecom_customer,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_number: customer.phone_number,
        field_mappings: field_mappings,
        remote_id: customer.remote_id,
        created_at: customer.created_at.toISOString(),
        modified_at: customer.modified_at.toISOString(),
        addresses: customer.ecom_addresses,
      };

      let res: UnifiedEcommerceCustomerOutput = UnifiedEcommerceCustomer;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: customer.id_ecom_customer,
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
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.customer.pull',
          method: 'GET',
          url: '/ecommerce/customer',
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

  async getCustomers(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedEcommerceCustomerOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ecom_customers.findFirst({
          where: {
            id_connection: connection_id,
            id_ecom_customer: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const customers = await this.prisma.ecom_customers.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ecom_customer: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
        include: {
          ecom_addresses: true,
        },
      });

      if (customers.length === limit + 1) {
        next_cursor = Buffer.from(
          customers[customers.length - 1].id_ecom_customer,
        ).toString('base64');
        customers.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const UnifiedEcommerceCustomers: UnifiedEcommerceCustomerOutput[] = await Promise.all(
        customers.map(async (customer) => {
          // Fetch field mappings for the customer
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: customer.id_ecom_customer,
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
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedEcommerceCustomerOutput format
          return {
            id: customer.id_ecom_customer,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone_number: customer.phone_number,
            field_mappings: field_mappings,
            remote_id: customer.remote_id,
            created_at: customer.created_at.toISOString(),
            modified_at: customer.modified_at.toISOString(),
            addresses: customer.ecom_addresses,
          };
        }),
      );

      let res: UnifiedEcommerceCustomerOutput[] = UnifiedEcommerceCustomers;

      if (remote_data) {
        const remote_array_data: UnifiedEcommerceCustomerOutput[] = await Promise.all(
          res.map(async (customer) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: customer.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...customer, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.customer.pull',
          method: 'GET',
          url: '/ecommerce/customers',
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
