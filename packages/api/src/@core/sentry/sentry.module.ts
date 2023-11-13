// sentry.module.ts
import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './sentry.interceptor';
import config from '../utils/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({})
export class SentryModule {
  static forRoot(): DynamicModule {
    const sentry_dsn = config.SENTRY_DSN;
    const distribution = config.DISTRIBUTION;

    //enable sentry only if we are in production environment and if the product is managed by Panora
    if (sentry_dsn && distribution == 'managed') {
      Sentry.init({
        dsn: sentry_dsn,
      });
    }

    const providers: Provider[] = [];

    if (distribution === 'managed') {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: SentryInterceptor,
      });
    }

    return {
      module: SentryModule,
      providers: providers,
      exports: providers,
    };
  }
}
