import { Module } from '@nestjs/common';
import { FilestorageConnectionsService } from './services/filestorage.connection.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { GoogleDriveConnectionService } from './services/google_drive/google_drive.service';
import { DropboxConnectionService } from './services/dropbox/dropbox.service';
import { SharepointConnectionService } from './services/sharepoint/sharepoint.service';
import { OneDriveConnectionService } from './services/onedrive/onedrive.service';
import { BoxConnectionService } from './services/box/box.service';
import { ConnectionUtils } from '../@utils';
@Module({
  imports: [WebhookModule],
  providers: [
    FilestorageConnectionsService,
    PrismaService,
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
