import { PrismaService } from '@@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

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
      if (!res) return undefined;

      return res.id_tcg_user;
    } catch (error) {
      throw error;
    }
  }

  async getUserRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
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
      if (!res) return undefined;

      return res.id_tcg_contact;
    } catch (error) {
      throw error;
    }
  }

  async getContactRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          id_tcg_contact: uuid,
        },
      });
      if (!res) return undefined;

      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getAsigneeRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getAssigneeMetadataFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) return undefined;
      return res.email_address;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionUuidFromRemoteId(
    remote_id: string,
    remote_platform: string,
  ) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return undefined;

      return res.id_tcg_collection;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          id_tcg_collection: uuid,
        },
      });
      if (!res) return undefined;

      return res.remote_id;
    } catch (error) {
      throw error;
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
      if (!res) return undefined;

      return res.id_tcg_ticket;
    } catch (error) {
      throw error;
    }
  }

  async getTicketRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          id_tcg_ticket: uuid,
        },
      });
      if (!res) return undefined;

      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
}
