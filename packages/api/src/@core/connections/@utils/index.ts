import { PrismaService } from '@@core/prisma/prisma.service';
import { ConnectionsError, throwTypedError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type ConnectionMetadata = {
  linkedUserId: string;
  remoteSource: string;
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
      };
    } catch (error) {
      throw error;
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

  applyPanoraDelimiter(values: string[]): string {
    return values.join('panoradelimiter');
  }
}
