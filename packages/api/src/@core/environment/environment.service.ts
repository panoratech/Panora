import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type OAuth = {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type RateLimit = {
  ttl: string;
  limit: string;
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

  /* CRM */

  getHubspotAuth(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('HUBSPOT_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('HUBSPOT_CLIENT_SECRET'),
    };
  }

  getAttioSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ATTIO_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('ATTIO_CLIENT_SECRET'),
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

  /* TICKETING */

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

  getFrontSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('FRONT_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('FRONT_CLIENT_SECRET'),
    };
  }

  getGithubSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GITHUB_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
    };
  }

  getGorgiasSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GORGIAS_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GORGIAS_CLIENT_SECRET'),
    };
  }

  getJiraSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('JIRA_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('JIRA_CLIENT_SECRET'),
    };
  }

  getGitlabSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GITLAB_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GITLAB_CLIENT_SECRET'),
    };
  }

  getJiraServiceManagementSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('JIRA_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('JIRA_CLIENT_SECRET'),
    };
  }

  getLinearSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('LINEAR_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('LINEAR_CLIENT_SECRET'),
    };
  }

  getClickupSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('CLICKUP_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('CLICKUP_CLIENT_SECRET'),
    };
  }

  getThrottleConfig(): RateLimit {
    return {
      ttl: this.configService.get<string>('THROTTLER_TTL'),
      limit: this.configService.get<string>('THROTTLER_LIMIT'),
    };
  }
}
