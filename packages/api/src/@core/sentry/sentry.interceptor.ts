// sentry.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Sentry from '@sentry/node';
import { catchError } from 'rxjs/operators';
import config from '../utils/config';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (config.SENTRY_DSN && config.DISTRIBUTION === 'managed') {
          Sentry.captureException(error);
        }
        throw error;
      }),
    );
  }
}
