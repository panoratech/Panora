import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  CallbackParams,
  IConnectionCategory,
  PassthroughInput,
  RefreshParams,
} from '@@core/connections/@utils/types';
import { Injectable } from '@nestjs/common';
import { connections as Connection } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from './registry.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { PassthroughResponse } from '@@core/passthrough/types';

@Injectable()
export class CrmConnectionsService implements IConnectionCategory {
  constructor(
    private serviceRegistry: ServiceRegistry,
    private connectionCategoryRegistry: CategoryConnectionRegistry,
    private webhook: WebhookService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(CrmConnectionsService.name);
    this.connectionCategoryRegistry.registerService('crm', this);
  }

  async handleCallBack(
    providerName: string,
    callbackOpts: CallbackParams,
    type_strategy: 'oauth2' | 'apikey' | 'basic',
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
          id_connection: data.id_connection,
          id_project: data.id_project,
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
      await this.webhook.dispatchWebhook(
        data,
        'connection.created',
        callbackOpts.projectId,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleTokensRefresh(
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
      await service.handleTokenRefresh(refreshOpts);
    } catch (error) {
      throw error;
    }
  }

  async passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse> {
    try {
      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });
      const serviceName = connection.provider_slug.toLowerCase();
      const service = this.serviceRegistry.getService(serviceName);
      if (!service) {
        throw new ReferenceError(`Unknown provider, found ${serviceName}`);
      }
      return await service.passthrough(input, connectionId);
    } catch (error) {
      throw error;
    }
  }
}
