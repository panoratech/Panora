import { connections as Connection } from '@prisma/client';

export type CallbackParams = {
  linkedUserId: string;
  projectId: string;
  code: string;
};

export type RefreshParams = {
  connectionId: string;
  refreshToken: string;
  account_url?: string;
  projectId: string;
};

export interface IMarketingautomationConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh(opts: RefreshParams): Promise<any>;
}
