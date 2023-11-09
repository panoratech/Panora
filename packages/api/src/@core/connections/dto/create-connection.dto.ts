class BaseConnectionDto {
  customerId: string;
  providerName: string;
}

interface OAuth {
  projectId: string;
  returnUrl: string;
}

interface ApiKey {
  apiKey: string;
}

interface AccessKeys {
  accessKeyId: string;
  secretAccessKey: string;
}

export type CreateConnectionDto<T> = BaseConnectionDto & T;

export type CreateConnectionDtoOauth = CreateConnectionDto<OAuth>;
export type CreateConnectionDtoApiKey = CreateConnectionDto<ApiKey>;
export type CreateConnectionDtoAccessKeys = CreateConnectionDto<AccessKeys>;
