import {
  JsonData,
  MultipartData,
} from '@@core/passthrough/dto/passthrough.dto';
import { AxiosResponse } from 'axios';
import { BaseConnectionService } from './base.service';
import { connections as Connection } from '@prisma/client';
import { PassthroughResponse } from '@@core/passthrough/types';

export type OAuthCallbackParams = {
  projectId: string;
  linkedUserId: string;
  code: string;
  [key: string]: any;
};

export type APIKeyCallbackParams = {
  projectId: string;
  linkedUserId: string;
  apikey: string;
  body_data?: { [key: string]: any };
};

export type BasicAuthCallbackParams = Omit<APIKeyCallbackParams, 'apikey'>;

// Define the discriminated union type for callback parameters
export type CallbackParams =
  | APIKeyCallbackParams
  | OAuthCallbackParams
  | BasicAuthCallbackParams;

export type RefreshParams = {
  connectionId: string;
  refreshToken: string;
  account_url?: string;
  projectId: string;
};

export type PassthroughInput = {
  method: 'GET' | 'POST';
  path: string;
  headers?: Record<string, string | number>;
  req_type: 'MULTIPART' | 'JSON';
  overrideBaseUrl?: string;
  data?: JsonData | MultipartData[];
};

export type PassthroughConfig = Pick<
  PassthroughInput,
  'method' | 'data' | 'headers'
> & {
  url: string;
  linkedUserId?: string;
};
export interface IConnectionCategory {
  handleCallBack(
    providerName: string,
    callbackOpts: CallbackParams,
    type_strategy: 'oauth' | 'apikey' | 'basic',
  ): Promise<void>;

  handleTokensRefresh(
    connectionId: string,
    providerName: string,
    refresh_token: string,
    id_project: string,
    account_url?: string,
  ): Promise<void>;

  redirectUponConnection?(...params: any[]): void;

  passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse>;
}

export interface IConnectionService extends BaseConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh?(opts: RefreshParams): Promise<any>;
  redirectUponConnection?(...params: any[]): void;
  passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse>;
}

export abstract class AbstractBaseConnectionService
  extends BaseConnectionService
  implements IConnectionService
{
  abstract handleCallback(opts: CallbackParams): Promise<Connection>;
  abstract handleTokenRefresh?(opts: RefreshParams): Promise<any>;

  abstract passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse>;
}
