import { EnvironmentService } from '@@core/environment/environment.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello You Are On The Panora API!`;
  }
}
