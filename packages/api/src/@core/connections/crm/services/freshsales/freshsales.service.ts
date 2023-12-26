import { Injectable } from '@nestjs/common';
import {
  CallbackParams,
  ICrmConnectionService,
  RefreshParams,
} from '../../types';
import { connections as Connection } from '@prisma/client';

@Injectable()
export class FreshsalesConnectionService implements ICrmConnectionService {
  //TODO: later
  async handleCallback(opts: CallbackParams): Promise<Connection> {
    return;
  }
  async handleTokenRefresh(opts: RefreshParams) {
    return;
  }
}
