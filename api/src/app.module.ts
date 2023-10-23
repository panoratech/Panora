import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';

@Module({
  imports: [CrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
