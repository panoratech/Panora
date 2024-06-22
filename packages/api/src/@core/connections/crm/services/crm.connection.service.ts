import { Injectable } from '@nestjs/common';
import { ConnectionsError, throwTypedError } from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { connections as Connection } from '@prisma/client';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from './registry.service';
import {
  APIKeyCallbackParams,
  CallbackParams,
  OAuthCallbackParams,
  RefreshParams,
} from '@@core/connections/@utils/types';

@Injectable()
export class CrmConnectionsService {
  constructor(
    private serviceRegistry: ServiceRegistry,
    private webhook: WebhookService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(CrmConnectionsService.name);
  }

  async handleCrmCallBack(
    providerName: string,
    callbackOpts: CallbackParams,
    type_strategy: 'oauth' | 'apikey' | 'basic',
  ) {
    try {
      const serviceName = providerName.toLowerCase();

      const service = this.serviceRegistry.getService(serviceName);

      if (!service) {
        throw new ReferenceError(`Unknown provider, found ${providerName}`);
      }
      const data: Connection = await service.handleCallback(callbackOpts);
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'connection.created',
          method: 'GET',
          url: `/${type_strategy}/callback`,
          provider: providerName.toLowerCase(),
          direction: '0',
          timestamp: new Date(),
          id_linked_user: callbackOpts.linkedUserId,
        },
      });
      //directly send the webhook
      await this.webhook.handlePriorityWebhook(
        data,
        'connection.created',
        callbackOpts.projectId,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleCrmTokensRefresh(
    connectionId: string,
    providerName: string,
    refresh_token: string,
    id_project: string,
    account_url?: string,
  ) {
    try {
      const serviceName = providerName.toLowerCase();
      const service = this.serviceRegistry.getService(serviceName);
      if (!service) {
        throw new ReferenceError(`Unknown provider, found ${providerName}`);
      }
      const refreshOpts: RefreshParams = {
        connectionId: connectionId,
        refreshToken: refresh_token,
        account_url: account_url,
        projectId: id_project,
      };
      const data = await service.handleTokenRefresh(refreshOpts);
    } catch (error) {
      throw error;
    }
  }
}
