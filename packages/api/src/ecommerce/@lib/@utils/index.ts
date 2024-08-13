import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Address } from '../@types';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderIdFromRemote(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ecom_orders.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_ecom_order;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerFromUUID(customer_id: string) {
    try {
      const res = await this.prisma.ecom_customers.findUnique({
        where: {
          id_ecom_customer: customer_id,
        },
        include: { ecom_addresses: true },
      });
      if (!res) return;
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerIdFromRemote(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ecom_customers.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_ecom_customer;
    } catch (error) {
      throw error;
    }
  }
  async getProductIdFromRemote(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ecom_products.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_ecom_product;
    } catch (error) {
      throw error;
    }
  }

  normalizeAddresses(addresses: Address[]) {
    if (addresses) {
      const normalizedAddresses = addresses.map((addy) => ({
        ...addy,
        created_at: new Date(),
        modified_at: new Date(),
        id_ecom_address: uuidv4(),
        address_type: addy.address_type === '' ? 'primary' : addy.address_type,
      }));
      return normalizedAddresses;
    }
    return [];
  }

  normalizeVariants(
    variants: {
      title: string;
      price: number;
      sku: string;
      options: any;
      weight: number;
      inventory_quantity: number;
    }[],
  ) {
    if (variants) {
      const normalizedVar = variants.map((data) => ({
        ...(data as any),
        created_at: new Date(),
        modified_at: new Date(),
        id_ecom_product_variant: uuidv4(),
      }));
      return normalizedVar;
    }
    return [];
  }
}
