import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';
import { AuthModule } from './@core/auth/auth.module';
import { AuthService } from './@core/auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CrmModule, AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
