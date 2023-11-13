export enum CRM_PROVIDERS {
  ZOHO = 'zoho',
  ZENDESK = 'zendesk',
  HUBSPOT = 'hubspot',
  PIPEDRIVE = 'pipedrive',
  FRESHSALES = 'freshsales',
}

export const providersConfig = {
  'CRM': {
    'hubspot': {
      clientId: 'ba591170-a7c7-4fca-8086-1bd178c6b14d',
      scopes: 'crm.objects.contacts.read crm.objects.contacts.write'
    },
    // TODO
    'zoho': {
      clientId: 'Zoho_Client_Id',
      scopes: 'Zoho_Scope'
    },
    'pipedrive': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope'
    },
    'freshsales': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope'
    },
    'zendesk': {
      clientId: 'Pipedrive_Client_Id',
      scopes: 'Pipedrive_Scope'
    },

  }
};

export const providerAuthBaseUrls = {
  'hubspot': `https://app-eu1.hubspot.com/oauth/authorize`, // TODO: HANDLE EU/US DOMAIN
  'zoho': `https://accounts.zoho.com/oauth/v2/auth`,
  'pipedrive': `https://oauth.pipedrive.com/oauth/authorize`,
  'freshsales': `https://some-freshsales-auth-url`, // Replace with actual URL
  'zendesk': `https://some-zendesk-auth-url`,       // Replace with actual URL
};