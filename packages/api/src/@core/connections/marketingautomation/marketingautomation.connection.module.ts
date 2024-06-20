import { Module } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { MarketingAutomationConnectionsService } from './services/marketingautomation.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { ConnectionUtils } from '../@utils';
import { BrevoConnectionService } from './services/brevo/brevo.service';
import { PodiumConnectionService } from './services/podium/podium.service';
import { MailchimpConnectionService } from './services/mailchimp/mailchimp.service';
import { GetresponseConnectionService } from './services/getresponse/getresponse.service';
import { KeapConnectionService } from './services/keap/keap.service';
import { KlaviyoConnectionService } from './services/klaviyo/klaviyo.service';

@Module({
  imports: [WebhookModule],
  providers: [
    MarketingAutomationConnectionsService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    ConnectionUtils,
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
