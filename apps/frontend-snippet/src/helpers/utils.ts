type ProviderConfig = {
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
};

type VerticalConfig = {
  [key: string]: ProviderConfig;
};

type ProvidersConfig = {
  [vertical: string]: VerticalConfig;
};


export const providersConfig: ProvidersConfig = {
  'CRM': {
    'hubspot': {
      clientId: 'ba591170-a7c7-4fca-8086-1bd178c6b14d',
      scopes: 'crm.objects.contacts.read crm.objects.contacts.write',
      authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
      logoPath: './assets/crm/hubspot_logo.png',
    },
    'zoho': {
      clientId: '1000.CWBWAO0XK6QNROXMA2Y0RUZYMGJIGT',
      scopes: 'AaaServer.profile.Read', //todo
      authBaseUrl: 'https://accounts.zoho.eu/oauth/v2/auth',
      logoPath: 'assets/crm/zoho_logo.png',
    },
    'pipedrive': {
      clientId: '8a60094f9108f085',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
      logoPath: 'assets/crm/pipedrive_logo.jpeg',
    },
    //TODO
    'freshsales': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: '',
      logoPath: 'assets/crm/freshsales_logo.webp',
    },
    //TODO
    'zendesk': {
      clientId: 'panora-zendesk',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
      logoPath: 'assets/crm/zendesk_logo.png',
    },

  },
  'Accounting': {
    'pennylane': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './assets/accounting/pennylanelogo.png',
    },
    'freshbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './assets/accounting/freshbooks.jpeg',
    },
    'clearbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './assets/accounting/clearbooksLogo.png',
    },
    'freeAgent': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './assets/accounting/freeagent.png',
    },
    'sage': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: './assets/accounting/sageLogo.png',
    },
  }
};

type Provider = {
  name: string;
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
};

export function providersArray(vertical: string): Provider[] {
  if(!providersConfig[vertical]){
    return [];
  }
  return Object.entries(providersConfig[vertical]).map(([providerName, config]) => {
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
      const providers = providersConfig[vertical];
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
