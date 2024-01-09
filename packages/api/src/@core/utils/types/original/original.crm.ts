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
  FreshsalesCompanyOutput,
  HubspotCompanyOutput,
  PipedriveCompanyOutput,
  ZendeskCompanyOutput,
  ZohoCompanyOutput,
  FreshsalesEngagementInput,
  FreshsalesEngagementOutput,
  FreshsalesLeadInput,
  FreshsalesLeadOutput,
  FreshsalesNoteInput,
  FreshsalesNoteOutput,
  FreshsalesStageInput,
  FreshsalesStageOutput,
  FreshsalesTaskInput,
  FreshsalesTaskOutput,
  HubspotDealOutput,
  HubspotEngagementInput,
  HubspotEngagementOutput,
  HubspotLeadInput,
  HubspotLeadOutput,
  HubspotStageInput,
  HubspotStageOutput,
  HubspotTaskInput,
  HubspotTaskOutput,
  PipedriveEngagementInput,
  PipedriveEngagementOutput,
  PipedriveLeadInput,
  PipedriveLeadOutput,
  PipedriveStageInput,
  PipedriveStageOutput,
  PipedriveTaskInput,
  PipedriveTaskOutput,
  ZendeskEngagementInput,
  ZendeskEngagementOutput,
  ZendeskLeadInput,
  ZendeskLeadOutput,
  ZendeskStageInput,
  ZendeskStageOutput,
  ZendeskTaskInput,
  ZendeskTaskOutput,
  ZohoEngagementInput,
  ZohoEngagementOutput,
  ZohoLeadInput,
  ZohoLeadOutput,
  ZohoNoteInput,
  ZohoNoteOutput,
  ZohoStageInput,
  ZohoStageOutput,
  ZohoTaskInput,
  ZohoTaskOutput,
  FreshsalesUserOutput,
  HubspotUserOutput,
  PipedriveUserOutput,
  ZendeskUserOutput,
  ZohoUserOutput,
  FreshsalesUserInput,
  HubspotUserInput,
  PipedriveUserInput,
  ZendeskUserInput,
  ZohoUserInput,
} from '@crm/@utils/@types';
import { FreshsalesDealOutput } from '@crm/deal/services/freshsales/types';
import { PipedriveDealOutput } from '@crm/deal/services/pipedrive/types';
import { ZendeskDealOutput } from '@crm/deal/services/zendesk/types';
import { ZohoDealOutput } from '@crm/deal/services/zoho/types';
import {
  HubspotNoteInput,
  HubspotNoteOutput,
} from '@crm/note/services/hubspot/types';
import {
  PipedriveNoteInput,
  PipedriveNoteOutput,
} from '@crm/note/services/pipedrive/types';
import {
  ZendeskNoteInput,
  ZendeskNoteOutput,
} from '@crm/note/services/zendesk/types';

/* INPUT */

/* contact */
export type OriginalContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;

/* deal */
export type OriginalDealInput =
  | FreshsalesDealOutput
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput;

/* company */
export type OriginalCompanyInput =
  | FreshsalesCompanyOutput
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput;

/* engagement */
export type OriginalEngagementInput =
  | FreshsalesEngagementInput
  | HubspotEngagementInput
  | ZohoEngagementInput
  | ZendeskEngagementInput
  | PipedriveEngagementInput;

/* note */
export type OriginalNoteInput =
  | FreshsalesNoteInput
  | HubspotNoteInput
  | ZohoNoteInput
  | ZendeskNoteInput
  | PipedriveNoteInput;

/* task */
export type OriginalTaskInput =
  | FreshsalesTaskInput
  | HubspotTaskInput
  | ZohoTaskInput
  | ZendeskTaskInput
  | PipedriveTaskInput;

/* stage */
export type OriginalStageInput =
  | FreshsalesStageInput
  | HubspotStageInput
  | ZohoStageInput
  | ZendeskStageInput
  | PipedriveStageInput;

/* lead */
export type OriginalLeadInput =
  | FreshsalesLeadInput
  | HubspotLeadInput
  | ZohoLeadInput
  | ZendeskLeadInput
  | PipedriveLeadInput;

/* user */
export type OriginalUserInput =
  | FreshsalesUserInput
  | HubspotUserInput
  | ZohoUserInput
  | ZendeskUserInput
  | PipedriveUserInput;

export type CrmObjectInput =
  | OriginalContactInput
  | OriginalDealInput
  | OriginalCompanyInput
  | OriginalEngagementInput
  | OriginalNoteInput
  | OriginalTaskInput
  | OriginalStageInput
  | OriginalLeadInput
  | OriginalUserInput;

/* OUTPUT */

export type OriginalContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;

/* deal */
export type OriginalDealOutput =
  | FreshsalesDealOutput
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput;

/* company */
export type OriginalCompanyOutput =
  | FreshsalesCompanyOutput
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput;

/* engagement */
export type OriginalEngagementOutput =
  | FreshsalesEngagementOutput
  | HubspotEngagementOutput
  | ZohoEngagementOutput
  | ZendeskEngagementOutput
  | PipedriveEngagementOutput;

/* note */
export type OriginalNoteOutput =
  | FreshsalesNoteOutput
  | HubspotNoteOutput
  | ZohoNoteOutput
  | ZendeskNoteOutput
  | PipedriveNoteOutput;

/* task */
export type OriginalTaskOutput =
  | FreshsalesTaskOutput
  | HubspotTaskOutput
  | ZohoTaskOutput
  | ZendeskTaskOutput
  | PipedriveTaskOutput;

/* stage */
export type OriginalStageOutput =
  | FreshsalesStageOutput
  | HubspotStageOutput
  | ZohoStageOutput
  | ZendeskStageOutput
  | PipedriveStageOutput;

/* lead */
export type OriginalLeadOutput =
  | FreshsalesLeadOutput
  | HubspotLeadOutput
  | ZohoLeadOutput
  | ZendeskLeadOutput
  | PipedriveLeadOutput;

/* user */
export type OriginalUserOutput =
  | FreshsalesUserOutput
  | HubspotUserOutput
  | ZohoUserOutput
  | ZendeskUserOutput
  | PipedriveUserOutput;

export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompanyOutput
  | OriginalEngagementOutput
  | OriginalNoteOutput
  | OriginalTaskOutput
  | OriginalStageOutput
  | OriginalLeadOutput
  | OriginalUserOutput;
