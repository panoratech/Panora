import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { ManagedWebhooksError, throwTypedError } from '@@core/utils/errors';
import {
  ManagedWebhooksDto,
  RemoteThirdPartyCreationDto,
} from './dto/managed-webhooks.dto';
import { ConnectorCategory } from '@panora/shared';
import { TicketingWebhookHandlerService } from '@ticketing/@webhook/handler.service';

@Injectable()
export class ManagedWebhooksService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private ticketingHandler: TicketingWebhookHandlerService,
  ) {
    this.logger.setContext(ManagedWebhooksService.name);
  }

  async getManagedWebhook(conn_id: string) {
    try {
      return await this.prisma.managed_webhooks.findFirst({
        where: {
          id_connection: conn_id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateStatusManagedWebhookEndpoint(id: string, active: boolean) {
    try {
      return await this.prisma.managed_webhooks.update({
        where: { id_managed_webhook: id },
        data: { active: active },
      });
    } catch (error) {
      throw error;
    }
  }

  async createManagedWebhook(data: ManagedWebhooksDto) {
    try {
      return await this.prisma.managed_webhooks.create({
        data: {
          id_managed_webhook: uuidv4(),
          active: true,
          id_connection: data.id_connection,
          endpoint: uuidv4(),
          api_version: data.api_version || '',
          created_at: new Date(),
          modified_at: new Date(),
          active_events: data.scopes,
          remote_signing_secret: data.remote_signature_secret || '',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createRemoteThirdPartyWebhook(data: RemoteThirdPartyCreationDto) {
    try {
      const conn = await this.prisma.connections.findFirst({
        where: {
          id_connection: data.id_connection,
        },
      });
      if (!conn) throw new ReferenceError('Connection undefined');
      switch (conn.vertical) {
        case ConnectorCategory.Ticketing:
          return await this.ticketingHandler.createExternalWebhook(
            data.id_connection,
            data.data,
            data.mw_ids,
          );
      }
    } catch (error) {
      throw error;
    }
  }
}
