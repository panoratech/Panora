export const CRM_PROVIDERS = [
  'zoho',
  'zendesk',
  'hubspot',
  'pipedrive',
  'freshsales',
];
export const HRIS_PROVIDERS = [];
export const ATS_PROVIDERS = [];
export const ACCOUNTING_PROVIDERS = [];
export const TICKETING_PROVIDERS = [];
export const MARKETING_AUTOMATION_PROVIDERS = [];
export const FILE_STORAGE_PROVIDERS = [];

export enum ProviderVertical {
  CRM = 'CRM',
  HRIS = 'HRIS',
  ATS = 'ATS',
  Accounting = 'Accounting',
  Ticketing = 'Ticketing',
  MarketingAutomation = 'Marketing Automation',
  FileStorage = 'File Storage',
  Unknown = 'Unknown', // Used if the provider does not match any category
}
export function getProviderVertical(providerName: string): ProviderVertical {
  if (CRM_PROVIDERS.includes(providerName)) {
    return ProviderVertical.CRM;
  }
  if (HRIS_PROVIDERS.includes(providerName)) {
    return ProviderVertical.HRIS;
  }
  if (ATS_PROVIDERS.includes(providerName)) {
    return ProviderVertical.ATS;
  }
  if (ACCOUNTING_PROVIDERS.includes(providerName)) {
    return ProviderVertical.Accounting;
  }
  if (TICKETING_PROVIDERS.includes(providerName)) {
    return ProviderVertical.Ticketing;
  }
  if (MARKETING_AUTOMATION_PROVIDERS.includes(providerName)) {
    return ProviderVertical.MarketingAutomation;
  }
  if (FILE_STORAGE_PROVIDERS.includes(providerName)) {
    return ProviderVertical.FileStorage;
  }
  return ProviderVertical.Unknown;
}
