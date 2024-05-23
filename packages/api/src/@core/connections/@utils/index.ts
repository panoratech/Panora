import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export type ConnectionMetadata = {
  linkedUserId: string;
  remoteSource: string;
};

export class ConnectionUtils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getConnectionMetadataFromConnectionToken(
    token: string,
  ): Promise<ConnectionMetadata> {
    try {
      // console.log('token is ' + token);
      if (!token)
        throw new Error('token provided for connection token is invalid');
      const res = await this.prisma.connections.findFirst({
        where: {
          connection_token: token,
        },
      });
      if (!res) throw new Error(`connection not found for token ${token}`);
      return {
        linkedUserId: res.id_linked_user,
        remoteSource: res.provider_slug,
      };
    } catch (error) {
      throw new Error(error);
    }
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
}
