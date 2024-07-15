import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ITicketingConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import { CONNECTORS_METADATA } from '@panora/shared';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { APIKeyCallbackParams } from '@@core/connections/@utils/types';

@Injectable()
export class DixaConnectionService implements ITicketingConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(DixaConnectionService.name);
    this.registry.registerService('dixa', this);
  }

  async handleCallback(opts: APIKeyCallbackParams) {
    try {
      const { linkedUserId, projectId } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dixa',
          vertical: 'ticketing',
        },
      });

      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(opts.apikey),
            account_url: CONNECTORS_METADATA['ticketing']['dixa'].urls
              .apiUrl as string,
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'dixa',
            vertical: 'ticketing',
            token_type: 'api_key',
            account_url: CONNECTORS_METADATA['ticketing']['dixa'].urls
              .apiUrl as string,
            access_token: this.cryptoService.encrypt(opts.apikey),
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: {
                id_linked_user: await this.connectionUtils.getLinkedUserId(
                  projectId,
                  linkedUserId,
                ),
              },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      throw error;
    }
  }
}
