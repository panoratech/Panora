import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './crm/contact/contact.module';
import { CrmModule } from './crm/crm.module';
import { AuthModule } from './_core/auth/auth.module';
import { AuthService } from './_core/auth/auth.service';

@Module({
  imports: [CrmModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
