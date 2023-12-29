import {
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
  FreshsalesContactOutput,
  HubspotContactOutput,
  PipedriveContactOutput,
  ZendeskContactOutput,
  ZohoContactOutput,
} from '@crm/@utils/@types';

/* INPUT */

/* contact */
export type OriginalContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;

/* deal */
export type OriginalDealInput = '';

/* company */
export type OriginalCompanyInput = '';

export type CrmObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompanyInput;

/* OUTPUT */

export type OriginalContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;

export type OriginalCompanyOutput = '';

export type OriginalDealOutput = '';

export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompanyOutput;
