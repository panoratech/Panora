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

  async getStageIdFromStageUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          id_crm_deals_stage: uuid,
        },
      });
      if (!res) throw new Error(`crm_deals_stages not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getStageUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_deals_stages not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_deals_stage;
    } catch (error) {
      throw new Error(error);
    }
  }
}
