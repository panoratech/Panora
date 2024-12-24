import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    //console.log(process.env.SENTRY_DSN);
    return `Hello You Are On The Panora API!`;
  }
}
