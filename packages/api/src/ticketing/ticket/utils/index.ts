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
    } catch (error) {}
  }

  async get_Zendesk_AttachmentsTokensFromUuid(uuids: string[]) {
    try {
      let uploads = [];
      uuids.map(async (uuid) => {
        const res = await this.prisma.tcg_attachments.findUnique({
          where: {
            id_tcg_attachment: uuid,
          },
          select: token,
        });
        if (!res) throw new Error(`tcg_attachment not found for uuid ${uuid}`);
        uploads = [...uploads, res.token];
      });
      return uploads;
    } catch (error) {}
  }

  async get_Front_AttachmentsFromUuid(uuids: string[]) {
    try {
      let uploads = [];
      uuids.map(async (uuid) => {
        const res = await this.prisma.tcg_attachments.findUnique({
          where: {
            id_tcg_attachment: uuid,
          },
        });
        if (!res) throw new Error(`tcg_attachment not found for uuid ${uuid}`);
        //TODO: construct the right binary attachment
        const url = res.file_url;
        uploads = [...uploads, url];
      });
      return uploads;
    } catch (error) {}
  }
}
