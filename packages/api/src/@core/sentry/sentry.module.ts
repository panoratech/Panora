// sentry.module.ts
import { Module, DynamicModule, Global } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './sentry.interceptor';
import config from '../utils/config';

@Global()
@Module({})
export class SentryModule {
  static forRoot(): DynamicModule {
    const isProduction = config.NODE_ENV === 'production';
    const sentry_dsn = config.SENTRY_DSN;
    const distribution = config.DISTRIBUTION;

    //enable sentry only if we are in production environment and if the product is managed by Panora
    if (isProduction && sentry_dsn && distribution == 'managed') {
      Sentry.init({
        dsn: sentry_dsn,
      });
    }

    return {
      module: SentryModule,
      providers: isProduction
        ? [{ provide: 'APP_INTERCEPTOR', useClass: SentryInterceptor }]
        : [],
      exports: isProduction
        ? [{ provide: 'APP_INTERCEPTOR', useClass: SentryInterceptor }]
        : [],
    };
  }
}
