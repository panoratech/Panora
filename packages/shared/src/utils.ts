type ProviderConfig = {
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description: string;
};
  
type VerticalConfig = {
  [key: string]: ProviderConfig;
};

type ProvidersConfig = {
  [vertical: string]: VerticalConfig;
};
  
  
export const providersConfig: ProvidersConfig = {
  'crm': {
    'hubspot': {
      clientId: 'ba591170-a7c7-4fca-8086-1bd178c6b14d',
      scopes: 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.deals.read crm.schemas.deals.write crm.objects.deals.read crm.objects.deals.write crm.objects.companies.read crm.objects.companies.write crm.objects.owners.read settings.users.read settings.users.write settings.users.teams.read settings.users.teams.write',
      authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
      logoPath: './../assets/crm/hubspot_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"
    },
    'zoho': {
      clientId: '1000.CWBWAO0XK6QNROXMA2Y0RUZYMGJIGT',
      scopes: 'ZohoCRM.modules.ALL',
      authBaseUrl: 'https://accounts.zoho.eu/oauth/v2/auth',
      logoPath: './../assets/crm/zoho_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'pipedrive': {
      clientId: '8a60094f9108f085',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
      logoPath: './../assets/crm/pipedrive_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    //TODO
    'freshsales': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: '',
      logoPath: './../assets/crm/freshsales_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'zendesk': {
      clientId: 'fbb3125a89f366daf02c09f201522245c4453c1310f07ec2223c614fac130c78',
      scopes: 'read write',
      authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
      logoPath: './../assets/crm/zendesk_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },

  },
  'ticketing': {
    'front': {
      clientId: '5f1d8d963c77285f339a',
      scopes: '',
      authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
      logoPath: './../assets/ticketing/front_logo.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"

    },
    'zendesk_tcg': {
      clientId: 'panora_bbb',
      scopes: 'read write',
      authBaseUrl: 'https://panora7548.zendesk.com/oauth/authorizations/new',
      logoPath: './../assets/crm/zendesk_logo.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"
    },
  },
  'accounting': {
    'pennylane': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './../assets/accounting/pennylane_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'freshbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './../assets/accounting/freshbooks_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'clearbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './../assets/accounting/clearbooks_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'freeagent': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './../assets/accounting/freeagent_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'sage': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './../assets/accounting/sage_logo.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
  }
};

export const getDescription = (name: string): string | null => {
  const vertical = findProviderVertical(name);
  if(vertical == null){
    return null;
  }
  return providersConfig[vertical.toLowerCase()][name].description;
}

type Provider = {
  name: string;
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description?: string;
};

export function providersArray(vertical: string): Provider[] {
  if(!providersConfig[vertical.toLowerCase()]){
    return [];
  }
  return Object.entries(providersConfig[vertical.toLowerCase()]).map(([providerName, config]) => {
    return {
      name: providerName,
      clientId: config.clientId,
      scopes: config.scopes,
      authBaseUrl: config.authBaseUrl,
      logoPath: config.logoPath,
    };
  });
}

export const findProviderVertical = (providerName: string): string | null => {
  for (const [vertical, providers] of Object.entries(providersConfig)) {
    if (providers.hasOwnProperty.call(providers, providerName)) {
      return vertical;
    }
  }
  return null;
};

export function findProviderByName(providerName: string): Provider | null {
  for (const vertical in providersConfig) {
    if (providersConfig.hasOwnProperty.call(providersConfig, vertical)) {
      const providers = providersConfig[vertical.toLowerCase()];
      if (providers.hasOwnProperty.call(providers, providerName)) {
        const providerDetails = providers[providerName];
        return {
          name: providerName,
          ...providerDetails,
        };
      }
    }
  }
  return null;
}
  