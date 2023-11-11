import { HttpException, Injectable } from '@nestjs/common';
import { LoggerService } from './@core/logger/logger.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
