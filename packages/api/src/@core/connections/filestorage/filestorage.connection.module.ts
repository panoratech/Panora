import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { BoxConnectionService } from './services/box/box.service';
import { DropboxConnectionService } from './services/dropbox/dropbox.service';
import { FilestorageConnectionsService } from './services/filestorage.connection.service';
import { GoogleDriveConnectionService } from './services/google_drive/google_drive.service';
import { OneDriveConnectionService } from './services/onedrive/onedrive.service';
import { ServiceRegistry } from './services/registry.service';
import { SharepointConnectionService } from './services/sharepoint/sharepoint.service';
@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    FilestorageConnectionsService,
    ServiceRegistry,
    WebhookService,
    EnvironmentService,
    ConnectionsStrategiesService,
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
