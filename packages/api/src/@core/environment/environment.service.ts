import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type OAuth = {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  getEnvMode(): string {
    return this.configService.get<string>('ENV');
  }
  getSentryDsn(): string {
    return this.configService.get<string>('SENTRY_DSN');
  }
  getDistributionMode(): string {
    return this.configService.get<string>('DISTRIBUTION');
  }
  getDatabaseURL(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
  getOAuthRredirectBaseUrl(): string {
    return this.configService.get<string>('OAUTH_REDIRECT_BASE');
  }
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  getCryptoKey(): string {
    return this.configService.get<string>('ENCRYPT_CRYPTO_SECRET_KEY');
  }
  getHubspotAuth(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('HUBSPOT_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('HUBSPOT_CLIENT_SECRET'),
    };
  }
  getZohoSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZOHO_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
    };
  }
  getZendeskSellSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZENDESK_SELL_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>(
        'ZENDESK_SELL_CLIENT_SECRET',
      ),
    };
  }

  getZendeskTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZENDESK_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>(
        'ZENDESK_TICKETING_CLIENT_SECRET',
      ),
    };
  }

  getZendeskTicketingSubdomain(): string {
    return this.configService.get<string>('ZENDESK_TICKETING_SUBDOMAIN');
  }

  getFreshsalesSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('FRESHSALES_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('FRESHSALES_CLIENT_SECRET'),
    };
  }
  getPipedriveSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('PIPEDRIVE_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('PIPEDRIVE_CLIENT_SECRET'),
    };
  }
}
