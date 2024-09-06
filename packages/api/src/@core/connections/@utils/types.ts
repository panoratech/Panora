import {
  JsonData,
  MultipartData,
} from '@@core/passthrough/dto/passthrough.dto';
import { BaseConnectionService } from './base.service';
import { PassthroughResponse } from '@@core/passthrough/types';
import { ApiProperty } from '@nestjs/swagger';
import { connections as Connection2 } from '@prisma/client';

export type OAuthCallbackParams = {
  projectId: string;
  linkedUserId: string;
  code?: string;
  [key: string]: any;
};

export type APIKeyCallbackParams = {
  projectId: string;
  linkedUserId: string;
  body?: { [key: string]: any };
};

export type BasicAuthCallbackParams = APIKeyCallbackParams;

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
    type_strategy: 'oauth2' | 'apikey' | 'basic',
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
  handleCallback(opts: CallbackParams): Promise<Connection2>;
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
  abstract handleCallback(opts: CallbackParams): Promise<Connection2>;
  abstract handleTokenRefresh?(opts: RefreshParams): Promise<any>;

  abstract passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse>;
}

export class Connection {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the connection',
  })
  id_connection: string;

  @ApiProperty({
    type: String,
    example: 'active',
    description: 'Status of the connection',
  })
  status: string;

  @ApiProperty({
    type: String,
    example: 'hubspot',
    description: 'Slug for the provider',
  })
  provider_slug: string;

  @ApiProperty({
    type: String,
    example: 'crm',
    description: 'Vertical category of the connection',
  })
  vertical: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/account',
    description: 'URL of the account',
  })
  account_url?: string;

  @ApiProperty({
    type: String,
    example: 'oauth2',
    enum: ['oauth2', 'apikey', 'basic'],
    description: 'Strategy type',
  })
  token_type: string;

  @ApiProperty({
    type: String,
    example: 'access_token_example',
    description: 'Access token for the connection',
  })
  access_token?: string;

  @ApiProperty({
    type: String,
    example: 'refresh_token_example',
    description: 'Refresh token for the connection',
  })
  refresh_token?: string;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'Expiration timestamp of the access token',
  })
  expiration_timestamp?: Date;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'Timestamp when the connection was created',
  })
  created_at: Date;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID Token for the connection',
  })
  connection_token?: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Project ID associated with the connection',
  })
  id_project: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Linked user ID associated with the connection',
  })
  id_linked_user: string;
}
