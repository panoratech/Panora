import { CallbackParams, RefreshParams } from '@@core/connections/@utils/types';
import { connections as Connection } from '@prisma/client';

export interface IHrisConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh?(opts: RefreshParams): Promise<any>;
}
