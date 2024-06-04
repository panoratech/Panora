import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    /*this.cryptoService = new EncryptionService(
      new EnvironmentService(new ConfigService()),
    );*/
  }

  async fetchFileStreamFromURL(file_url: string) {
    return fs.createReadStream(file_url);
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
      return res.id_tcg_user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      return res.remote_id;
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
      if (!res) return;
      return res.id_tcg_contact;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          id_tcg_contact: uuid,
        },
      });
      if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      return res.remote_id;
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

  async getCollectionUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_collection;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCollectionRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          id_tcg_collection: uuid,
        },
      });
      if (!res) return;
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTicketUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_ticket;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTicketRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          id_tcg_ticket: uuid,
        },
      });
      if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }
}
