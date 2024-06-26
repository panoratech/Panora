import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { ConnectionUtils } from '../@utils';
import { BoxConnectionService } from './services/box/box.service';
import { DropboxConnectionService } from './services/dropbox/dropbox.service';
import { FilestorageConnectionsService } from './services/filestorage.connection.service';
import { GoogleDriveConnectionService } from './services/google_drive/google_drive.service';
import { OneDriveConnectionService } from './services/onedrive/onedrive.service';
import { ServiceRegistry } from './services/registry.service';
import { SharepointConnectionService } from './services/sharepoint/sharepoint.service';
@Module({
  imports: [WebhookModule],
  providers: [
    FilestorageConnectionsService,
    ServiceRegistry,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ConnectionsStrategiesService,
    ConnectionUtils,
    // PROVIDERS SERVICES
    GoogleDriveConnectionService,
    DropboxConnectionService,
    SharepointConnectionService,
    OneDriveConnectionService,
    BoxConnectionService,
  ],
  exports: [FilestorageConnectionsService],
})
export class FilestorageConnectionModule {}
