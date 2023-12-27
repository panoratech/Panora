import {
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from '@crm/@types';
import { ZendeskTicketInput } from '@ticketing/@types';

/* CRM */

/* contact */
export type OriginalContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;

export type OriginalDealInput = '';

export type OriginalCompaniesInput = '';

/* TICKETING */

/* ticket */

export type OriginalTicketInput = ZendeskTicketInput | '';

/* Union Vertical Types */

export type CrmObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;

export type TicketingObjectInput = OriginalTicketInput | '';

export type AtsObjectInput = '';

export type MarketingAutomationObjectInput = '';

export type AccountingObjectInput = '';

export type FileStorageObjectInput = '';

export type HrisObjectInput = '';
