import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}
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
}
