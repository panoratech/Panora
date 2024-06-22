import { CONNECTORS_METADATA } from './connectors/metadata';
import { ACCOUNTING_PROVIDERS, ATS_PROVIDERS, CRM_PROVIDERS, FILESTORAGE_PROVIDERS, HRIS_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, TICKETING_PROVIDERS } from './connectors';
import { AuthStrategy, AuthType, DynamicApiUrl, DynamicAuthorization, StaticApiUrl, StringAuthorization, VerticalConfig } from './types';
import { categoriesVerticals, ConnectorCategory } from './categories';

export const randomString = () => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    result += charSet[randomIndex];
  }
  return result;
}

function getActiveProvidersForVertical(vertical: string): VerticalConfig {
  const verticalConfig = CONNECTORS_METADATA[vertical.toLowerCase()];
  if (!verticalConfig) {
    return {};
  }

  const activeProviders: VerticalConfig = {};
  for (const [providerName, config] of Object.entries(verticalConfig)) {
    if (config.active !== false) { // Assuming undefined or true means active
      activeProviders[providerName] = config;
    }
  }

  return activeProviders;
}

export const getDescription = (name: string): string | null => {
  const vertical = findConnectorCategory(name);
  if (vertical == null) {
    return null;
  }
  const activeProviders = getActiveProvidersForVertical(vertical);
  const provider = activeProviders[name];
  return provider ? provider.description : null;
};

export interface Provider {
  vertical?: string;
  name: string;
  urls: {
    docsUrl: string;
    apiUrl: StaticApiUrl | DynamicApiUrl;
    authBaseUrl?: StringAuthorization | DynamicAuthorization;
  };
  scopes?: string; 
  logoPath: string;
  description?: string;
  authStrategy: AuthType;
}; 

export function providersArray(vertical?: string): Provider[] {
  if (vertical) {
    // If a specific vertical is provided, return providers for that vertical
    const activeProviders = getActiveProvidersForVertical(vertical);
    return Object.entries(activeProviders).map(([providerName, config]) => ({
      vertical: vertical.toLowerCase(),
      name: providerName,
      urls: { 
        docsUrl: config.urls.docsUrl,
        apiUrl: config.urls.apiUrl,
        authBaseUrl: config.urls.authBaseUrl,
      },
      scopes: config.scopes,
      logoPath: config.logoPath,
      description: config.description,
      authStrategy: {
        strategy: config.authStrategy.strategy,
        properties: config.authStrategy.properties ? config.authStrategy.properties : [],
      }
    }));
  } else {
    // If no vertical is provided, return providers for all verticals
    let allProviders: Provider[] = [];
    categoriesVerticals.forEach(vertical => {
      const activeProviders = getActiveProvidersForVertical(vertical);
      const providersForVertical = Object.entries(activeProviders).map(([providerName, config]) => ({
        vertical: vertical.toLowerCase(),
        name: providerName,
        urls: {
          docsUrl: config.urls.docsUrl,
          apiUrl: config.urls.apiUrl,
          authBaseUrl: config.urls.authBaseUrl,
        },
        scopes: config.scopes,
        logoPath: config.logoPath,
        description: config.description,
        authStrategy: {
          strategy: config.authStrategy.strategy,
          properties: config.authStrategy.properties ? config.authStrategy.properties : [],
        }
      }));
      allProviders = allProviders.concat(providersForVertical);
    });
    return allProviders;
  }
}

export const findConnectorCategory = (providerName: string): string | null => {
  for (const [vertical, providers] of Object.entries(CONNECTORS_METADATA)) {
    if (providers.hasOwnProperty.call(providers, providerName.toLowerCase())) {
      return vertical;
    }
  }
  return null;
};

export function findProviderByName(providerName: string): Provider | null {
  for (const vertical in CONNECTORS_METADATA) {
    if (CONNECTORS_METADATA.hasOwnProperty.call(CONNECTORS_METADATA, vertical)) {
      const activeProviders = getActiveProvidersForVertical(vertical);
      if (activeProviders.hasOwnProperty.call(activeProviders, providerName)) {
        const providerDetails = activeProviders[providerName];
        return {
          name: providerName,
          ...providerDetails,
        };
      }
    }
  }
  return null;
}

export function getLogoURL(providerName: string): string {
  const vertical = findConnectorCategory(providerName);
  if (vertical !== null) {
    return CONNECTORS_METADATA[vertical][providerName].logoPath
  }

  return ''

}

export function mergeAllProviders(...arrays: string[][]): { vertical: string, value: string }[] {
  const result: { vertical: string, value: string }[] = [];
  arrays.forEach((arr, index) => {
    const arrayName = Object.keys({ CRM_PROVIDERS, HRIS_PROVIDERS, ATS_PROVIDERS, ACCOUNTING_PROVIDERS, TICKETING_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, FILESTORAGE_PROVIDERS })[index];
    arr.forEach(item => {
      if (item !== '') {
        result.push({ vertical: arrayName.split('_')[0], value: item });
      }
    });
  });
  return result;
}

export const ALL_PROVIDERS: { vertical: string, value: string }[] = mergeAllProviders(CRM_PROVIDERS, HRIS_PROVIDERS, ATS_PROVIDERS, ACCOUNTING_PROVIDERS, TICKETING_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, FILESTORAGE_PROVIDERS)

export function slugFromCategory(category: ConnectorCategory) {
  switch(category) {
    case ConnectorCategory.Crm:
      return 'crm';
    case ConnectorCategory.Hris:
      return 'hris';
    case ConnectorCategory.Ats:
      return 'ats';
    case ConnectorCategory.Ticketing:
      return 'tcg';
    case ConnectorCategory.MarketingAutomation:
      return 'mktg';
    case ConnectorCategory.FileStorage:
      return 'fstg';
    case ConnectorCategory.Accounting:
      return 'actng';
    default: 
      return null;
  }
}

export function categoryFromSlug(slug: string): ConnectorCategory | null {
  switch (slug) {
    case 'crm':
      return ConnectorCategory.Crm;
    case 'hris':
      return ConnectorCategory.Hris;
    case 'ats':
      return ConnectorCategory.Ats;
    case 'tcg':
      return ConnectorCategory.Ticketing;
    case 'mktg':
      return ConnectorCategory.MarketingAutomation;
    case 'fstg':
      return ConnectorCategory.FileStorage;
    case 'actng':
      return ConnectorCategory.Accounting;
    default:
      return null;
  }
}
