import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  async fetchFileStreamFromURL(file_url: string) {
    return fs.createReadStream(file_url);
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

  getFileExtension(fileName: string): string | null {
    const parts = fileName.split('.');
    if (parts.length > 1) {
      return '.' + parts.pop()!.toLowerCase();
    }
    return null;
  }

  getMimeType(file_name: string): string {
    try {
      const extension = this.getFileExtension(file_name);
      if (!extension) throw new Error('extension doesnt exist for your file');
      const mimeTypes: { [key: string]: string } = {
        '.aac': 'audio/aac',
        '.abw': 'application/x-abiword',
        '.apng': 'image/apng',
        '.arc': 'application/x-freearc',
        '.avif': 'image/avif',
        '.avi': 'video/x-msvideo',
        '.azw': 'application/vnd.amazon.ebook',
        '.bin': 'application/octet-stream',
        '.bmp': 'image/bmp',
        '.bz': 'application/x-bzip',
        '.bz2': 'application/x-bzip2',
        '.cda': 'application/x-cdf',
        '.csh': 'application/x-csh',
        '.css': 'text/css',
        '.csv': 'text/csv',
        '.doc': 'application/msword',
        '.docx':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.eot': 'application/vnd.ms-fontobject',
        '.epub': 'application/epub+zip',
        '.gz': 'application/gzip',
        '.gif': 'image/gif',
        '.htm': 'text/html',
        '.html': 'text/html',
        '.ico': 'image/vnd.microsoft.icon',
        '.ics': 'text/calendar',
        '.jar': 'application/java-archive',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.jsonld': 'application/ld+json',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mjs': 'text/javascript',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.mpeg': 'video/mpeg',
        '.mpkg': 'application/vnd.apple.installer+xml',
        '.odp': 'application/vnd.oasis.opendocument.presentation',
        '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
        '.odt': 'application/vnd.oasis.opendocument.text',
        '.oga': 'audio/ogg',
        '.ogv': 'video/ogg',
        '.ogx': 'application/ogg',
        '.opus': 'audio/ogg',
        '.otf': 'font/otf',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
        '.php': 'application/x-httpd-php',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.rar': 'application/vnd.rar',
        '.rtf': 'application/rtf',
        '.sh': 'application/x-sh',
        '.svg': 'image/svg+xml',
        '.tar': 'application/x-tar',
        '.tif': 'image/tiff',
        '.tiff': 'image/tiff',
        '.ts': 'video/mp2t',
        '.ttf': 'font/ttf',
        '.txt': 'text/plain',
        '.vsd': 'application/vnd.visio',
        '.wav': 'audio/wav',
        '.weba': 'audio/webm',
        '.webm': 'video/webm',
        '.webp': 'image/webp',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.xhtml': 'application/xhtml+xml',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xml': 'application/xml',
        '.xul': 'application/vnd.mozilla.xul+xml',
        '.zip': 'application/zip',
        '.3gp': 'video/3gpp',
        '.3g2': 'video/3gpp2',
        '.7z': 'application/x-7z-compressed',
      };

      return mimeTypes[extension.toLowerCase()];
    } catch (error) {
      throw error;
    }
  }
}
