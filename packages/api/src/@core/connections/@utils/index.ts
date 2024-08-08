import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type ConnectionMetadata = {
  linkedUserId: string;
  remoteSource: string;
  connectionId: string;
  projectId: string;
  vertical: string;
};

@Injectable()
export class ConnectionUtils {
  constructor(private readonly prisma: PrismaService) {}

  async getConnectionMetadataFromConnectionToken(
    token: string,
  ): Promise<ConnectionMetadata> {
    try {
      const res = await this.prisma.connections.findFirst({
        where: {
          connection_token: token,
        },
      });
      if (!res)
        throw new ReferenceError(`Connection undefined for token ${token}`);
      return {
        linkedUserId: res.id_linked_user,
        remoteSource: res.provider_slug,
        connectionId: res.id_connection,
        vertical: res.vertical,
        projectId: res.id_project,
      };
    } catch (error) {
      throw error;
    }
  }

  async getConnectionMetadataFromConnectionId(uuid: string) {
    try {
      const conn = await this.prisma.connections.findUnique({
        where: {
          id_connection: uuid,
        },
      });
      return {
        linkedUserId: conn.id_linked_user,
        projectId: conn.id_project,
      };
    } catch (error) {}
  }

  async getLinkedUserId(
    projectId: string,
    linkedUserId: string,
  ): Promise<string> {
    const linked_user = await this.prisma.linked_users.findFirst({
      where: {
        id_linked_user: linkedUserId,
      },
    });
    let id_linked_user: string;
    if (!linked_user) {
      //create a linked-user out of remote_id
      const res = await this.prisma.linked_users.create({
        data: {
          id_linked_user: uuidv4(),
          id_project: projectId,
          linked_user_origin_id: linkedUserId,
          alias: '',
        },
      });
      id_linked_user = res.id_linked_user;
    } else {
      id_linked_user = linkedUserId;
    }
    return id_linked_user;
  }

  applyPanoraDelimiter(values: string[]): string {
    return values.join('panoradelimiter');
  }
}
