import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {}

  setContext(context: string) {
    this.pinoLogger.setContext(context);
  }

  log(message: string, context?: string) {
    if (context) this.setContext(context);
    this.pinoLogger.info(message);
  }

  error(message: string, trace: string, context?: string) {
    if (context) this.setContext(context);
    this.pinoLogger.error({ msg: message, trace });
  }

  warn(message: string, context?: string) {
    if (context) this.setContext(context);
    this.pinoLogger.warn(message);
  }

  debug(message: string, context?: string) {
    if (context) this.setContext(context);
    this.pinoLogger.debug(message);
  }
}
