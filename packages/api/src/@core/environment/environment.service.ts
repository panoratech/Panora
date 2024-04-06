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

//for providers secret it is of the form
// get{provider_name}{vertical_name}Secret
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

  getThrottleConfig(): RateLimit {
    return {
      ttl: this.configService.get<string>('THROTTLER_TTL'),
      limit: this.configService.get<string>('THROTTLER_LIMIT'),
    };
  }

  /* CRM */
 /*
  getHubspotCrmAuth(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('HUBSPOT_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('HUBSPOT_CRM_CLIENT_SECRET'),
    };
  }

  getAttioCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ATTIO_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('ATTIO_CRM_CLIENT_SECRET'),
    };
  }

  getZohoCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZOHO_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('ZOHO_CRM_CLIENT_SECRET'),
    };
  }

  getZendeskCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZENDESK_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>(
        'ZENDESK_CRM_CLIENT_SECRET',
      ),
    };
  }

  getFreshsalesCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('FRESHSALES_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('FRESHSALES_CRM_CLIENT_SECRET'),
    };
  }

  getPipedriveCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('PIPEDRIVE_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('PIPEDRIVE_CRM_CLIENT_SECRET'),
    };
  }

  getAcceloCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ACCELO_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('ACCELO_CRM_CLIENT_SECRET'),
    };
  }*/

  /* TICKETING */
/*
  getZendeskTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('ZENDESK_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>(
        'ZENDESK_TICKETING_CLIENT_SECRET',
      ),
    };
  }

  getFrontTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('FRONT_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('FRONT_TICKETING_CLIENT_SECRET'),
    };
  }

  getGithubTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GITHUB_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GITHUB_TICKETING_CLIENT_SECRET'),
    };
  }

  getGorgiasTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GORGIAS_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GORGIAS_TICKETING_CLIENT_SECRET'),
    };
  }

  getJiraTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('JIRA_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('JIRA_TICKETING_CLIENT_SECRET'),
    };
  }

  getGitlabTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('GITLAB_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('GITLAB_TICKETING_CLIENT_SECRET'),
    };
  }

  getJiraServiceMgmtTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('JIRA_SERVICE_MGMT_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('JIRA_SERVICE_MGMT_TICKETING_CLIENT_SECRET'),
    };
  }

  getLinearTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('LINEAR_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('LINEAR_TICKETING_CLIENT_SECRET'),
    };
  }

  getClickupTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('CLICKUP_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('CLICKUP_TICKETING_CLIENT_SECRET'),
    };
  }

  getAffinityCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('AFFINITY_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('AFFINITY_CRM_CLIENT_SECRET'),
    };
  }

  getCapsuleCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('CAPSULE_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('CAPSULE_CRM_CLIENT_SECRET'),
    };
  }

  getCloseCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('CLOSE_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('CLOSE_CRM_CLIENT_SECRET'),
    };
  }

  getCopperCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('COPPER_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('COPPER_CRM_CLIENT_SECRET'),
    };
  }
  
  getInsightlyCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('INSIGHTLY_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('INSIGHTLY_CRM_CLIENT_SECRET'),
    };
  }
  
  getKeapCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('KEAP_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('KEAP_CRM_CLIENT_SECRET'),
    };
  }
  
  getSugarcrmCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('SUGARCRM_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('SUGARCRM_CRM_CLIENT_SECRET'),
    };
  }
  
  getTeamleaderCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('TEAMLEADER_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('TEAMLEADER_CRM_CLIENT_SECRET'),
    };
  }
  
  getTeamworkCrmSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('TEAMWORK_CRM_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('TEAMWORK_CRM_CLIENT_SECRET'),
    };
  }
  
  getAhaTicketingSecret(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('AHA_TICKETING_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('AHA_TICKETING_CLIENT_SECRET'),
    };
  }
  */
  }
