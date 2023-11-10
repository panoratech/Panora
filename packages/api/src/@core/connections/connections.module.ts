import { Module } from '@nestjs/common';
import { CrmConnectionModule } from './crm/crm-connection.module';

@Module({
  imports: [CrmConnectionModule],
})
export class ConnectionsModule {}
