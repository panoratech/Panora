import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SentryService } from './sentry.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.sentryService.captureException(error);
        return throwError(() => error);
      }),
    );
  }
} 