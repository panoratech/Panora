import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { ConnectionUtils } from '../@utils';
import { BrevoConnectionService } from './services/brevo/brevo.service';
import { GetresponseConnectionService } from './services/getresponse/getresponse.service';
import { KeapConnectionService } from './services/keap/keap.service';
import { KlaviyoConnectionService } from './services/klaviyo/klaviyo.service';
import { MailchimpConnectionService } from './services/mailchimp/mailchimp.service';
import { MarketingAutomationConnectionsService } from './services/marketingautomation.connection.service';
import { PodiumConnectionService } from './services/podium/podium.service';
import { ServiceRegistry } from './services/registry.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    MarketingAutomationConnectionsService,

    WebhookService,
    EnvironmentService,

    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    BrevoConnectionService,
    PodiumConnectionService,
    MailchimpConnectionService,
    GetresponseConnectionService,
    KeapConnectionService,
    KlaviyoConnectionService,
  ],
  exports: [MarketingAutomationConnectionsService],
})
export class MarketingAutomationConnectionsModule {}
