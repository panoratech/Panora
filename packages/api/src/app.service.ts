import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    //console.log(process.env.SENTRY_DSN);
    //throw new Error("My first Sentry error!");
    return `Hello You Are On The Panora API!`;
  }
}
