import { decrypt, decryptTwo } from '@@core/utils/crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('*********************');
    console.log(process.env.REFRESH_TEST);
    console.log(decryptTwo(Buffer.from(process.env.REFRESH_TEST || '', 'utf-8')));
    console.log('*********************'); 

    return 'Hello You Are On The Panora API!';
  }
}
