import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { getFileExtension, MIME_TYPES } from '@@core/utils/types';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  async fetchFileStreamFromURL(file_url: string) {
    return fs.createReadStream(file_url);
  }

  async getTeamUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_teams.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return undefined;

      return res.id_tcg_team;
    } catch (error) {
      throw error;
    }
  }

  async getTeamRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_teams.findFirst({
        where: {
          id_tcg_team: uuid,
        },
      });
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getRemoteIdFromTagName(name: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_tags.findFirst({
        where: {
          name: name,
          id_connection: connection_id,
        },
      });
      if (!res) return undefined;

      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getCommentUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_comments.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return undefined;

      return res.id_tcg_comment;
    } catch (error) {
      throw error;
    }
  }

  async getUserUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
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

  async getContactUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
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
    connection_id: string,
  ) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
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

  async getCollectionNameFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          id_tcg_collection: uuid,
        },
      });
      if (!res) return undefined;

      return res.name;
    } catch (error) {
      throw error;
    }
  }

  async getTicketUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
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

  getMimeType(file_name: string): string {
    try {
      const extension = getFileExtension(file_name);
      if (!extension) throw new Error('extension doesnt exist for your file');
      return MIME_TYPES[extension.toLowerCase()];
    } catch (error) {
      throw error;
    }
  }

  getFileExtensionFromMimeType(mimeType: string): string | undefined {
    try {
      const normalizedMimeType = mimeType.toLowerCase();
      for (const [extension, mime] of Object.entries(MIME_TYPES)) {
        if (mime.toLowerCase() === normalizedMimeType) {
          return extension;
        }
      }
      return undefined;
    } catch (error) {
      throw error;
    }
  }
}
