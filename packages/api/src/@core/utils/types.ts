import {
  CrmObject,
  FreshsalesContactInput,
  FreshsalesContactOutput,
  HubspotContactInput,
  HubspotContactOutput,
  PipedriveContactInput,
  PipedriveContactOutput,
  UnifiedCrm,
  ZendeskContactInput,
  ZendeskContactOutput,
  ZohoContactInput,
  ZohoContactOutput,
} from '@crm/@types';

import { HrisObject } from '@hris/@types';
import { AtsObject, UnifiedAts } from '@ats/@types';
import { AccountingObject } from '@accounting/@types';
import { MarketingAutomationObject } from '@marketing-automation/@types';
import { TicketingObject } from '@ticketing/@types';
import { FileStorageObject } from '@file-storage/@types';

export type Unified = UnifiedCrm | UnifiedAts;

// Actions TYPE
export type OriginalContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;
export type OriginalContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;
export type OriginalDealInput = '';
export type OriginalDealOutput = '';
export type OriginalCompaniesInput = '';
export type OriginalCompaniesOutput = '';

// Vertical Input Types
export type CrmObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type TicketingObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type AtsObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type MarketingAutomationObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type AccountingObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type FileStorageObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;
export type HrisObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;

// Vertical Output Types
export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type TicketingObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type AtsObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type MarketingAutomationObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type AccountingObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type FileStorageObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;
export type HrisObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;

//
export type TargetObject =
  | CrmObject
  | HrisObject
  | AtsObject
  | AccountingObject
  | FileStorageObject
  | MarketingAutomationObject
  | TicketingObject;

export type StandardObject = TargetObject;

export type DesunifyReturnType =
  | CrmObjectInput
  | TicketingObjectInput
  | AtsObjectInput
  | MarketingAutomationObjectInput
  | AccountingObjectInput
  | FileStorageObjectInput
  | HrisObjectInput;

export type UnifyReturnType = Unified | Unified[];

export type UnifySourceType =
  | CrmObjectOutput
  | TicketingObjectOutput
  | AtsObjectOutput
  | MarketingAutomationObjectOutput
  | AccountingObjectOutput
  | FileStorageObjectOutput
  | HrisObjectOutput;

export const domains = {
  CRM: {
    hubspot: 'https://api.hubapi.com',
    zoho: 'https://www.zohoapis.eu/crm/v3',
    zendesk: 'https://api.getbase.com/v2',
    freshsales: '',
    pipedrive: 'https://api.pipedrive.com',
  },
};

export const customPropertiesUrls = {
  CRM: {
    hubspot: `${domains['CRM']['hubspot']}/properties/v1/contacts/properties`,
    zoho: `${domains['CRM']['zoho']}/settings/fields?module=Contact`,
    zendesk: `${domains['CRM']['zendesk']}/contact/custom_fields`,
    freshsales: `${domains['CRM']['freshsales']}`, //TODO
    pipedrive: `${domains['CRM']['pipedrive']}/v1/personFields`,
  },
};

//TMP

export enum ProviderVertical {
  CRM = 'CRM',
  HRIS = 'HRIS',
  ATS = 'ATS',
  Accounting = 'Accounting',
  Ticketing = 'Ticketing',
  MarketingAutomation = 'Marketing Automation',
  FileStorage = 'File Storage',
  Unknown = 'Unknown',
}

export enum CrmProviders {
  ZOHO = 'zoho',
  ZENDESK = 'zendesk',
  HUBSPOT = 'hubspot',
  PIPEDRIVE = 'pipedrive',
  FRESHSALES = 'freshsales',
}

export enum AccountingProviders {
  PENNYLANE = 'pennylane',
  FRESHBOOKS = 'freshbooks',
  CLEARBOOKS = 'clearbooks',
  FREEAGENT = 'freeagent',
  SAGE = 'sage',
}

export const categoriesVerticals = Object.values(ProviderVertical);

export const CRM_PROVIDERS = [
  'zoho',
  'zendesk',
  'hubspot',
  'pipedrive',
  'freshsales',
];

export const HRIS_PROVIDERS = [''];
export const ATS_PROVIDERS = [''];
export const ACCOUNTING_PROVIDERS = [''];
export const TICKETING_PROVIDERS = [''];
export const MARKETING_AUTOMATION_PROVIDERS = [''];
export const FILE_STORAGE_PROVIDERS = [''];

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
