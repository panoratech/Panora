import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IAccountService } from '@ticketing/account/types';
import { ZendeskAccountOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class ZendeskService implements IAccountService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.account.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskAccountOutput[]>> {
    try {
      const { linkedUserId, webhook_remote_identifier } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });
      const remote_account_id = webhook_remote_identifier as string;
      const request_url = remote_account_id
        ? `${connection.account_url}/v2/organizations/${remote_account_id}.json`
        : `${connection.account_url}/v2/organizations.json`;
      const resp = await axios.get(request_url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk accounts !`);

      const result = remote_account_id
        ? [resp.data.organization]
        : resp.data.organizations;

      return {
        data: result,
        message: 'Zendesk accounts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
