import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { getFileExtension, MIME_TYPES } from '@@core/utils/types';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}
  getMimeType(file_name: string): string {
    try {
      const extension = getFileExtension(file_name);
      if (!extension) throw new Error('extension doesnt exist for your file');
      return MIME_TYPES[extension.toLowerCase()];
    } catch (error) {
      throw error;
    }
  }
  async getRemoteFolderParentId(id_folder: string) {
    try {
      const res = await this.prisma.fs_folders.findFirst({
        where: {
          id_fs_folder: id_folder,
        },
      });
      if (!res) return;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
  async getFolderIdFromRemote(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.fs_folders.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_fs_folder;
    } catch (error) {
      throw error;
    }
  }

  async getFileIdFromRemote(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.fs_files.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_fs_file;
    } catch (error) {
      throw error;
    }
  }
}
