import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { RetryHandler } from '@@core/@core-services/request-retry/retry.handler';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  AbstractBaseConnectionService,
  BasicAuthCallbackParams,
  PassthroughInput,
  RefreshParams,
} from '@@core/connections/@utils/types';
import { PassthroughResponse } from '@@core/passthrough/types';
import { Injectable } from '@nestjs/common';
import { CONNECTORS_METADATA } from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class AffinityConnectionService extends AbstractBaseConnectionService {
  constructor(
    protected prisma: PrismaService,
    private logger: LoggerService,
    protected cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private connectionUtils: ConnectionUtils,
    private retryService: RetryHandler,
  ) {
    super(prisma, cryptoService);
    this.logger.setContext(AffinityConnectionService.name);
    this.registry.registerService('affinity', this);
  }

  async passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse> {
    try {
      const { headers } = input;
      const config = await this.constructPassthrough(input, connectionId);

      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });

      config.headers['Authorization'] = `Basic ${Buffer.from(
        `${this.cryptoService.decrypt(connection.access_token)}:`,
      ).toString('base64')}`;

      config.headers = {
        ...config.headers,
        ...headers,
      };

      return await this.retryService.makeRequest(
        {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: config.headers,
        },
        'crm.affinity.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  handleTokenRefresh?(opts: RefreshParams): Promise<any> {
    return Promise.resolve();
  }

  async handleCallback(opts: BasicAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, body } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'affinity',
          vertical: 'crm',
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
            access_token: this.cryptoService.encrypt(body.password),
            account_url: CONNECTORS_METADATA['crm']['affinity'].urls
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
            provider_slug: 'affinity',
            vertical: 'crm',
            token_type: 'basic',
            account_url: CONNECTORS_METADATA['crm']['affinity'].urls
              .apiUrl as string,
            access_token: this.cryptoService.encrypt(body.password),
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
