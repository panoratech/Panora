import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          id_crm_user: uuid,
        },
      });
      if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromCompanyUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          id_crm_company: uuid,
        },
      });
      if (!res) throw new Error(`crm_companies not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCompanyUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_companies not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_company;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromContactUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_contacts.findFirst({
        where: {
          id_crm_contact: uuid,
        },
      });
      if (!res) throw new Error(`crm_contacts not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_contacts.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_contacts not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_contact;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromDealUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          id_crm_deal: uuid,
        },
      });
      if (!res) throw new Error(`crm_deals not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getDealUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_deals not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_deal;
    } catch (error) {
      throw new Error(error);
    }
  }
}
