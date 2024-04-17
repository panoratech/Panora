import { ProviderVertical } from "./enum";

export const categoriesVerticals = Object.values(ProviderVertical);

export const CRM_PROVIDERS = ['zoho', 'zendesk', 'hubspot', 'pipedrive', 'attio'];

export const HRIS_PROVIDERS = [''];
export const ATS_PROVIDERS = [''];
export const ACCOUNTING_PROVIDERS = [''];
export const TICKETING_PROVIDERS = ['zendesk', 'front', 'github', 'jira', 'gorgias'];
export const MARKETINGAUTOMATION_PROVIDERS = [''];
export const FILESTORAGE_PROVIDERS = [''];

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
  if (MARKETINGAUTOMATION_PROVIDERS.includes(providerName)) {
    return ProviderVertical.MarketingAutomation;
  }
  if (FILESTORAGE_PROVIDERS.includes(providerName)) {
    return ProviderVertical.FileStorage;
  }
  return ProviderVertical.Unknown;
}

function mergeAllProviders(...arrays: string[][]): { vertical: string, value: string }[] {
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
