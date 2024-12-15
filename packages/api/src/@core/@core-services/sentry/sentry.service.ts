import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  constructor() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.ENV || 'development',
        enabled: process.env.ENV === 'production',
        tracesSampleRate: 1.0,
      });
    }
  }

  captureException(exception: Error): void {
    Sentry.captureException(exception);
  }

  captureMessage(message: string): void {
    Sentry.captureMessage(message);
  }
} 