import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import {
  Action,
  ActionType,
  handle3rdPartyServiceError,
} from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';
import { SyncService as AccountSyncService } from '@ticketing/account/sync/sync.service';
import { SyncService as ContactSyncService } from '@ticketing/contact/sync/sync.service';
import { SyncService as TicketSyncService } from '@ticketing/ticket/sync/sync.service';
import { SyncService as UserSyncService } from '@ticketing/user/sync/sync.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { NonTicketPayload, Payload } from './types';
import { mapToRemoteEvent } from './utils';

@Injectable()
export class ZendeskHandlerService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private syncTicketsService: TicketSyncService,
    private syncUsersService: UserSyncService,
    private syncContactsService: ContactSyncService,
    private syncAccountsService: AccountSyncService,
  ) {
    this.logger.setContext(ZendeskHandlerService.name);
  }

  async createWebhook(data: { [key: string]: any }, mw_ids: string[]) {
    try {
      if (mw_ids[0]) {
        await this.createBasicWebhook(data.name_basic, mw_ids[0]);
      }
      if (mw_ids[1]) {
        await this.createTriggerWebhook(data.name_trigger, mw_ids[1]);
      }
    } catch (error) {
      throw error;
    }
  }

  async createBasicWebhook(webhook_name: string, mw_id: string) {
    try {
      const mw = await this.prisma.managed_webhooks.findUnique({
        where: {
          id_managed_webhook: mw_id,
        },
      });
      if (!mw) throw ReferenceError('Managed Webhook undefined');
      const conn = await this.prisma.connections.findUnique({
        where: {
          id_connection: mw.id_connection,
        },
      });
      if (!conn) throw ReferenceError('Connection undefined');
      const unified_events = mw.active_events;

      const events_ = Array.from(
        new Set(
          unified_events
            .flatMap((event) => mapToRemoteEvent(event))
            .filter((item) => item !== null && item !== undefined),
        ),
      ); // Converts the Set back into an array
      const body_data = {
        webhook: {
          name: webhook_name,
          status: 'active',
          endpoint: `${this.env.getWebhookIngress()}/mw/${mw.endpoint}`,
          http_method: 'POST',
          request_format: 'json',
          subscriptions: events_,
        },
      };

      this.logger.log('Creating basic webhook... ');

      const resp = await axios.post(
        `${conn.account_url}/webhooks`,
        JSON.stringify(body_data),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              conn.access_token,
            )}`,
          },
        },
      );

      this.logger.log(
        'Zendesk basic webhook created ' + JSON.stringify(resp.data),
      );

      this.logger.log('Fetching basic webhook secret... ');

      const webhook_result = await axios.get(
        `${conn.account_url}/webhooks/${resp.data.webhook.id}/signing_secret`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              conn.access_token,
            )}`,
          },
        },
      );
      //update signing secret inside mw table
      await this.prisma.managed_webhooks.update({
        where: {
          id_managed_webhook: mw.id_managed_webhook,
        },
        data: {
          remote_signing_secret: webhook_result.data.signing_secret.secret,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createTriggerWebhook(webhook_name: string, mw_id: string) {
    try {
      const mw = await this.prisma.managed_webhooks.findUnique({
        where: {
          id_managed_webhook: mw_id,
        },
      });
      if (!mw) throw ReferenceError('Managed Webhook undefined');

      const conn = await this.prisma.connections.findUnique({
        where: {
          id_connection: mw.id_connection,
        },
      });
      if (!conn) throw ReferenceError('Connection undefined');

      const body_data = {
        webhook: {
          name: webhook_name,
          status: 'active',
          endpoint: `${this.env.getWebhookIngress()}/mw/${mw.endpoint}`,
          http_method: 'POST',
          request_format: 'json',
          subscriptions: ['conditional_ticket_events'],
        },
      };

      this.logger.log('Creating trigger webhook... ');
      const resp = await axios.post(
        `${conn.account_url}/webhooks`,
        JSON.stringify(body_data),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              conn.access_token,
            )}`,
          },
        },
      );

      this.logger.log(
        'Zendesk trigger webhook created ' + JSON.stringify(resp.data),
      );

      // create trigger webhook
      const b_ = {
        trigger: {
          actions: [
            {
              field: 'notification_webhook',
              value: [
                resp.data.webhook.id,
                `
                {
                "id_ticket": "{{ticket.id}}"
                }
              `,
              ],
            },
          ],
          conditions: {
            any: [
              {
                field: 'assignee_id',
                operator: 'changed',
              },
              {
                field: 'attachment',
                operator: 'is',
                value: 'present',
              },
              {
                field: 'comment_is_public',
                value: 'true',
              },
              {
                field: 'priority',
                operator: 'changed',
              },
              {
                field: 'update_type',
                value: 'Create',
              },
              {
                field: 'update_type',
                value: 'Change',
              },
              {
                field: 'cc',
                operator: 'is',
                value: 'present',
              },
              {
                field: 'type',
                operator: 'changed',
              },
            ],
          },
          title: 'Trigger Webhooks',
        },
      };
      const trigger_result = await axios.post(
        `${conn.account_url}/triggers.json`,
        JSON.stringify(b_),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              conn.access_token,
            )}`,
          },
        },
      );

      this.logger.log('Fetching trigger webhook secret... ');
      const webhook_result = await axios.get(
        `${conn.account_url}/webhooks/${resp.data.webhook.id}/signing_secret`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              conn.access_token,
            )}`,
          },
        },
      );
      //update signing secret inside mw table
      await this.prisma.managed_webhooks.update({
        where: {
          id_managed_webhook: mw.id_managed_webhook,
        },
        data: {
          remote_signing_secret: webhook_result.data.signing_secret.secret,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async handler(payload: Payload, headers: any, id_managed_webhook: string) {
    try {
      await this.verifyWebhookAuthenticity(
        headers['x-zendesk-webhook-signature'],
        headers['x-zendesk-webhook-signature-timestamp'],
        payload,
        id_managed_webhook,
      );
      const mw = await this.prisma.managed_webhooks.findUnique({
        where: {
          id_managed_webhook: id_managed_webhook,
        },
      });
      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: mw.id_connection,
        },
      });
      if ('ticketId' in payload) {
        // ticket payload
        // TODO: update the ticket inside our db
        await this.syncTicketsService.syncForLinkedUser({
          integrationId: connection.provider_slug.toLowerCase(),
          linkedUserId: connection.id_linked_user,
          wh_real_time_trigger: {
            action: 'UPDATE',
            data: { remote_id: payload.ticketId as string },
          },
        });
      } else {
        //non-ticket payload
        const payload_ = payload as NonTicketPayload;
        const [event_type, event_action] = this.extractValue(payload_.type);
        switch (event_type) {
          case 'user':
            if (payload_.detail.role) {
              if (payload_.detail.role == 'end-user') {
                await this.syncContactsService.syncForLinkedUser({
                  integrationId: connection.provider_slug.toLowerCase(),
                  linkedUserId: connection.id_linked_user,
                  wh_real_time_trigger: {
                    action:
                      event_action.toLowerCase() == 'deleted'
                        ? 'DELETE'
                        : 'UPDATE',
                    data: { remote_id: payload_.detail.id as string },
                  },
                });
              } else if (
                payload_.detail.role == 'admin' ||
                payload_.detail.role == 'agent'
              ) {
                await this.syncUsersService.syncForLinkedUser({
                  integrationId: connection.provider_slug.toLowerCase(),
                  linkedUserId: connection.id_linked_user,
                  wh_real_time_trigger: {
                    action:
                      event_action.toLowerCase() == 'deleted'
                        ? 'DELETE'
                        : 'UPDATE',
                    data: { remote_id: payload_.detail.id as string },
                  },
                });
              } else {
                break;
              }
            }
            break;
          case 'organization':
            await this.syncAccountsService.syncForLinkedUser({
              integrationId: connection.provider_slug.toLowerCase(),
              linkedUserId: connection.id_linked_user,
              wh_real_time_trigger: {
                action:
                  event_action.toLowerCase() == 'deleted' ? 'DELETE' : 'UPDATE',
                data: { remote_id: payload_.detail.id as string },
              },
            });
          default:
            break;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  extractValue(typeString: string): string[] {
    const prefix = 'zen:event-type:';
    const startIndex = typeString.indexOf(prefix);

    if (startIndex === -1) {
      throw new Error('Prefix not found in the string.');
    }

    const afterPrefix = typeString.substring(startIndex + prefix.length);
    const values = afterPrefix.split(':');
    return [values[0], values[1]];
  }

  async verifyWebhookAuthenticity(
    signature: string,
    timestamp: string,
    body: any,
    id_managed_webhook: string,
  ) {
    try {
      const res = await this.prisma.managed_webhooks.findFirst({
        where: {
          id_managed_webhook: id_managed_webhook,
        },
      });
      const SIGNING_SECRET_ALGORITHM = 'sha256';
      const hmac = crypto.createHmac(
        SIGNING_SECRET_ALGORITHM,
        res.remote_signing_secret,
      );
      const sig = hmac.update(timestamp + body).digest('base64');
      return Buffer.compare(Buffer.from(signature), Buffer.from(sig)) === 0;
    } catch (error) {
      throw error;
    }
  }
}
