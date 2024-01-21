import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      /*throw new Error(
          `tcg_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );*/
      return res.id_tcg_user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAsigneeRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) return;
      /*throw new Error(
          `tcg_user not found for uuid ${uuid} and integration ${remote_platform}`,
        );*/
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAssigneeMetadataFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      return res.email_address;
    } catch (error) {
      throw new Error(error);
    }
  }
}
