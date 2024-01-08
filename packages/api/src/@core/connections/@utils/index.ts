import { PrismaClient } from '@prisma/client';

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
}
