import {
  FreshsalesContactOutput,
  HubspotContactOutput,
  PipedriveContactOutput,
  ZendeskContactOutput,
  ZohoContactOutput,
} from '@crm/@utils/@types';
import { ZendeskTicketOutput } from '@ticketing/@utils/@types';

/* CRM */

/* contact */

export type OriginalContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;

export type OriginalCompaniesOutput = '';

export type OriginalDealOutput = '';

/* TICKETING */

/* ticket */

export type OriginalTicketOutput = ZendeskTicketOutput;

/* Union Vertical Types */

export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;

export type TicketingObjectOutput = OriginalTicketOutput | '';

export type AtsObjectOutput = '';

export type MarketingAutomationObjectOutput = '';

export type AccountingObjectOutput = '';

export type FileStorageObjectOutput = '';

export type HrisObjectOutput = '';
