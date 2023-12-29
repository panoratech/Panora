import {
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from '@crm/@utils/@types';
import {
  ZendeskCommentInput,
  ZendeskTicketInput,
} from '@ticketing/@utils/@types';

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

export type OriginalTicketInput = ZendeskTicketInput;

/* comment */
export type OriginalCommentInput = ZendeskCommentInput;

/* Union Vertical Types */

export type CrmObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompaniesInput;

export type TicketingObjectInput = OriginalTicketInput | OriginalCommentInput;

export type AtsObjectInput = '';

export type MarketingAutomationObjectInput = '';

export type AccountingObjectInput = '';

export type FileStorageObjectInput = '';

export type HrisObjectInput = '';
