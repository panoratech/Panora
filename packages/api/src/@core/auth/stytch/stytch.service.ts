import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as StytchClient } from 'stytch';

@Injectable()
export class StytchService extends StytchClient {
  constructor(config: ConfigService) {
    super({
      project_id: config.get('STYTCH_PROJECT_ID'),
      secret: config.get('STYTCH_SECRET'),
    });
  }
}
