import { Module } from '@nestjs/common';
import { CrmConnectionsController } from './crm-connection.controller';
import { CrmConnectionsService } from './services/crm-connection.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { FreshsalesConnectionService } from './services/freshsales/freshsales.service';
import { HubspotConnectionService } from './services/hubspot/hubspot.service';
import { PipedriveConnectionService } from './services/pipedrive/pipedrive.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { ZohoConnectionService } from './services/zoho/zoho.service';

@Module({
  controllers: [CrmConnectionsController],
  providers: [
    CrmConnectionsService,
    PrismaService,
    FreshsalesConnectionService,
    HubspotConnectionService,
    PipedriveConnectionService,
    ZendeskConnectionService,
    ZohoConnectionService,
  ],
  exports: [CrmConnectionsService],
})
export class CrmConnectionModule {}
