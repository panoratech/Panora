import {
  FreshsalesContactOutput,
  HubspotContactOutput,
  PipedriveContactOutput,
  ZendeskContactOutput,
  ZohoContactOutput,
} from '@crm/@utils/@types';
import {
  ZendeskTicketOutput,
  ZendeskCommentOutput,
} from '@ticketing/@utils/@types';

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

/* comment */

export type OriginalCommentOutput = ZendeskCommentOutput;

/* Union Vertical Types */

export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompaniesOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput;

export type AtsObjectOutput = '';

export type MarketingAutomationObjectOutput = '';

export type AccountingObjectOutput = '';

export type FileStorageObjectOutput = '';

export type HrisObjectOutput = '';
