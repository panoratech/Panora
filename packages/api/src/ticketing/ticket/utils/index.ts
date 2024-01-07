import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
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
