import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchFileStreamFromURL(file_url: string) {
    //TODO;
    return;
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `tcg_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_tcg_user;
    } catch (error) {
      throw new Error(error);
    }
  }
  async getContactUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `tcg_contact not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_tcg_contact;
    } catch (error) {
      throw new Error(error);
    }
  }
}
