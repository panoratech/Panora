import { EncryptionService } from '@@core/encryption/encryption.service';
import { EnvironmentService } from '@@core/environment/environment.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Payload } from './types';
import { mapToRemoteEvent } from './utils';
import * as crypto from 'crypto';

@Injectable()
export class ZendeskHandlerService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
  ) {
    this.logger.setContext(ZendeskHandlerService.name);
  }

  async createWebhook(id_connection: string, data: { [key: string]: any }) {
    const conn = await this.prisma.connections.findFirst({
      where: {
        id_connection: id_connection,
      },
    });
    const mw = await this.prisma.managed_webhooks.findFirst({
      where: {
        id_connection: id_connection,
      },
    });
    const unified_events = mw.active_events;
    //const events = unified_events.flatMap((event) => mapToRemoteEvent(event));
    const events_ = unified_events
      .flatMap((event) => mapToRemoteEvent(event))
      .filter((event) => event !== '');

    let scopes = [];
    if (events_.length > 0) {
      // we create subs events
      scopes = events_;
    }
    /*if (events.includes('')) {
      //meaning we have to connect the webhook to a trigger as ticket events must be catched
      scopes.push('conditional_ticket_events');
    }*/
    const body_data = {
      webhook: {
        name: data.name,
        status: 'active',
        endpoint: `${this.env.getPanoraBaseUrl()}/mw/${mw.endpoint}`,
        http_method: 'POST',
        request_format: 'json',
        subscriptions: scopes,
      },
    };

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
    /*if (events.includes('')) {
      // create trigger webhook
      const b_ = {
        trigger: {
          actions: [
            {
              field: 'notification_webhook',
              value: [resp.data.webhook.id, ''], //todo
            },
          ],
          conditions: {
            all: [
              {
                field: 'status',
                operator: 'is',
                value: 'open',
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
    }*/

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
    return resp;
  }

  async handler(payload: Payload, headers: any, id_connection: string) {
    try {
      await this.verifyWebhookAuthenticity(
        headers['x-zendesk-webhook-signature'],
        headers['x-zendesk-webhook-signature-timestamp'],
        payload,
        id_connection,
      );
      //TODO: process the event data by sending it to a queue
      this.logger.log(
        'IM LOGGING PAYLOAD RECEIVED BY ZENDESK ---- ' +
          JSON.stringify(payload),
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyWebhookAuthenticity(
    signature: string,
    timestamp: string,
    body: any,
    id_connection: string,
  ) {
    try {
      const res = await this.prisma.managed_webhooks.findFirst({
        where: {
          id_connection: id_connection,
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
      throw new Error(error);
    }
  }
}
