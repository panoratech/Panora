import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { IAtsConnectionService } from '../../types';
import { CONNECTORS_METADATA } from '@panora/shared';
import { ConnectionUtils } from '@@core/connections/@utils';
import { APIKeyCallbackParams } from '@@core/connections/@utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class WorkdayConnectionService implements IAtsConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(WorkdayConnectionService.name);
    this.registry.registerService('workday', this);
  }

  async handleCallback(opts: APIKeyCallbackParams) {
    try {
      const { linkedUserId, projectId } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'workday',
          vertical: 'ats',
        },
      });

      let db_res;
      const connection_token = uuidv4();
      // construct a custom key as workday asks for 3 params (X-Api-Key, X-User-Token, X-User-Email)
      // we simply use the string panoradelimiter to separate and encode easily
      const data_to_encode = this.connectionUtils.applyPanoraDelimiter([
        opts.apikey,
        opts.body_data.userToken,
        opts.body_data.userEmail,
      ]);

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data_to_encode),
            account_url: CONNECTORS_METADATA['ats']['workday'].urls
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
            provider_slug: 'workday',
            vertical: 'ats',
            token_type: 'api_key',
            account_url: CONNECTORS_METADATA['ats']['workday'].urls
              .apiUrl as string,
            access_token: this.cryptoService.encrypt(data_to_encode),
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
