import { plainToClass } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';

export class EnvVars {
  @IsString()
  @IsOptional()
  ENV?: string;

  @IsString()
  @IsOptional()
  DISTRIBUTION?: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  //CRM
  @IsString()
  HUBSPOT_CLIENT_ID: string;

  @IsString()
  HUBSPOT_CLIENT_SECRET: string;

  @IsString()
  ZOHOCRM_CLIENT_ID: string;

  @IsString()
  ZOHOCRM_CLIENT_SECRET: string;

  @IsString()
  PIPEDRIVE_CLIENT_ID: string;

  @IsString()
  PIPEDRIVE_CLIENT_SECRET: string;

  @IsString()
  @IsOptional()
  FRESHSALES_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  FRESHSALES_CLIENT_SECRET?: string;

  @IsString()
  ZENDESK_SELL_CLIENT_ID: string;

  @IsString()
  ZENDESK_SELL_CLIENT_SECRET: string;

  @IsString()
  ZENDESK_TICKETING_CLIENT_ID: string;

  @IsString()
  ZENDESK_TICKETING_CLIENT_SECRET: string;

  @IsString()
  OAUTH_REDIRECT_BASE: string;

  @IsString()
  ENCRYPT_CRYPTO_SECRET_KEY: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  @IsOptional()
  THROTTLER_TTL?: string;

  @IsString()
  @IsOptional()
  THROTTLER_LIMIT?: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvVars, config);

  const errors = validateSync(validatedConfig);


  //TODO - Resolve this
  // if (errors.length) throw new Error(errors.toString());
  if (errors.length) {

  }

  return validatedConfig;
};
