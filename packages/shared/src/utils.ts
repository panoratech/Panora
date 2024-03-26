type ProviderConfig = {
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description: string;
  active?: boolean;
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
      logoPath: "https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"
    },
    'attio': {
      clientId: '86cbbd35-e067-4353-940b-5abcdcb539dd',
      scopes: 'record_permission:read',
      authBaseUrl: 'https://app.attio.com/authorize',
      logoPath: "https://asset.brandfetch.io/idZA7HYRWK/idYZS6Vp_r.png",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"
    },
    'zoho': {
      clientId: '1000.CWBWAO0XK6QNROXMA2Y0RUZYMGJIGT',
      scopes: 'ZohoCRM.modules.ALL',
      authBaseUrl: 'https://accounts.zoho.eu/oauth/v2/auth',
      logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'pipedrive': {
      clientId: '8a60094f9108f085',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
      logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    //TODO
    'freshsales': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },
    'zendesk': {
      clientId: 'fbb3125a89f366daf02c09f201522245c4453c1310f07ec2223c614fac130c78',
      scopes: 'read write',
      authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users"

    },

  },
  'ticketing': {
    'front': {
      clientId: '5f1d8d963c77285f339a',
      scopes: '',
      authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
      logoPath: 'https://i.pinimg.com/originals/43/a2/43/43a24316bd773798c7638ad98521eb81.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"

    },
    'zendesk_tcg': {
      clientId: 'panora_bbb',
      scopes: 'read write',
      authBaseUrl: 'https://panora7548.zendesk.com/oauth/authorizations/new',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"
    },
    'gorgias': {
      clientId: '',
      scopes: 'write:all openid email profile offline',
      authBaseUrl: 'https://panora.gorgias.com/oauth/authorize',
      logoPath: 'https://x5h8w2v3.rocketcdn.me/wp-content/uploads/2020/09/FS-AFFI-00660Gorgias.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"
    },
    'jira': {
      clientId: '1Xy0XSajM28HG7n9gufEyU0RO72SqEHW',
      scopes: 'read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work manage:jira-configuration read:jira-user offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: 'https://logowik.com/content/uploads/images/jira3124.jpg',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users"
    },
    'jira_service_mgmt': {
      clientId: '1Xy0XSajM28HG7n9gufEyU0RO72SqEHW',
      scopes: 'read:servicedesk-request manage:servicedesk-customer read:servicemanagement-insight-objects write:servicedesk-request offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'linear': {
      clientId: '',
      scopes: 'read,write',
      authBaseUrl: 'https://linear.app/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'gitlab': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://gitlab.example.com/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'clickup': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://app.clickup.com/api',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
  },
  'accounting': {
    'pennylane': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://cdn-images-1.medium.com/max/1200/1*wk7CNGik_1Szbt7s1fNZxA.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clearbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/icon/clear-books-icon-cmyk.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freeagent': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU-fob0b9pBNQdm80usnYa2yWdagm3eeBDH-870vSmfg&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Sage_Group_logo_2022.svg/2560px-Sage_Group_logo_2022.svg.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  } 
};

function getActiveProvidersForVertical(vertical: string): VerticalConfig {
  const verticalConfig = providersConfig[vertical.toLowerCase()];
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
  const vertical = findProviderVertical(name);
  if (vertical == null) {
    return null;
  }
  const activeProviders = getActiveProvidersForVertical(vertical);
  const provider = activeProviders[name];
  return provider ? provider.description : null;
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
  const activeProviders = getActiveProvidersForVertical(vertical);
  return Object.entries(activeProviders).map(([providerName, config]) => ({
      name: providerName,
      clientId: config.clientId,
      scopes: config.scopes,
      authBaseUrl: config.authBaseUrl,
      logoPath: config.logoPath,
      description: config.description,
  }));
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
