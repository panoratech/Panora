import { AttioCompanyOutput } from '@crm/company/services/attio/types';
import { HubspotCompanyOutput } from '@crm/company/services/hubspot/types';
import { PipedriveCompanyOutput } from '@crm/company/services/pipedrive/types';
import { ZendeskCompanyOutput } from '@crm/company/services/zendesk/types';
import { ZohoCompanyOutput } from '@crm/company/services/zoho/types';
import {
  AttioContactInput,
  AttioContactOutput,
} from '@crm/contact/services/attio/types';
import {
  HubspotContactInput,
  HubspotContactOutput,
} from '@crm/contact/services/hubspot/types';
import {
  PipedriveContactInput,
  PipedriveContactOutput,
} from '@crm/contact/services/pipedrive/types';
import {
  ZohoContactInput,
  ZohoContactOutput,
} from '@crm/contact/services/zoho/types';
import { HubspotDealOutput } from '@crm/deal/services/hubspot/types';
import { PipedriveDealOutput } from '@crm/deal/services/pipedrive/types';
import { ZendeskDealOutput } from '@crm/deal/services/zendesk/types';
import { ZohoDealOutput } from '@crm/deal/services/zoho/types';
import {
  HubspotEngagementInput,
  HubspotEngagementOutput,
} from '@crm/engagement/services/hubspot/types';
import {
  PipedriveEngagementInput,
  PipedriveEngagementOutput,
} from '@crm/engagement/services/pipedrive/types';
import {
  ZendeskEngagementInput,
  ZendeskEngagementOutput,
} from '@crm/engagement/services/zendesk/types';
import {
  ZohoEngagementInput,
  ZohoEngagementOutput,
} from '@crm/engagement/services/zoho/types';
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
import { ZohoNoteInput, ZohoNoteOutput } from '@crm/note/services/zoho/types';
import {
  HubspotStageInput,
  HubspotStageOutput,
} from '@crm/stage/services/hubspot/types';
import {
  PipedriveStageInput,
  PipedriveStageOutput,
} from '@crm/stage/services/pipedrive/types';
import {
  ZendeskStageInput,
  ZendeskStageOutput,
} from '@crm/stage/services/zendesk/types';
import {
  ZohoStageInput,
  ZohoStageOutput,
} from '@crm/stage/services/zoho/types';
import {
  HubspotTaskInput,
  HubspotTaskOutput,
} from '@crm/task/services/hubspot/types';
import {
  PipedriveTaskInput,
  PipedriveTaskOutput,
} from '@crm/task/services/pipedrive/types';
import {
  ZendeskTaskInput,
  ZendeskTaskOutput,
} from '@crm/task/services/zendesk/types';
import { ZohoTaskInput, ZohoTaskOutput } from '@crm/task/services/zoho/types';
import {
  HubspotUserInput,
  HubspotUserOutput,
} from '@crm/user/services/hubspot/types';
import {
  PipedriveUserInput,
  PipedriveUserOutput,
} from '@crm/user/services/pipedrive/types';
import { ZohoUserInput, ZohoUserOutput } from '@crm/user/services/zoho/types';
import {
  ZendeskContactInput,
  ZendeskContactOutput,
} from '@ticketing/contact/services/zendesk/types';
import {
  ZendeskUserInput,
  ZendeskUserOutput,
} from '@ticketing/user/services/zendesk/types';

/* INPUT */

/* contact */
export type OriginalContactInput =
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput
  | AttioContactInput;

/* deal */
export type OriginalDealInput =
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput;

/* company */
export type OriginalCompanyInput =
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput
  | AttioCompanyOutput;

/* engagement */
export type OriginalEngagementInput =
  | HubspotEngagementInput
  | ZohoEngagementInput
  | ZendeskEngagementInput
  | PipedriveEngagementInput;

/* note */
export type OriginalNoteInput =
  | HubspotNoteInput
  | ZohoNoteInput
  | ZendeskNoteInput
  | PipedriveNoteInput;

/* task */
export type OriginalTaskInput =
  | HubspotTaskInput
  | ZohoTaskInput
  | ZendeskTaskInput
  | PipedriveTaskInput;

/* stage */
export type OriginalStageInput =
  | HubspotStageInput
  | ZohoStageInput
  | ZendeskStageInput
  | PipedriveStageInput;

/* engagementType */

/* user */
export type OriginalUserInput =
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
  | OriginalUserInput;

/* OUTPUT */

export type OriginalContactOutput =
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput
  | AttioContactOutput;

/* deal */
export type OriginalDealOutput =
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput;

/* company */
export type OriginalCompanyOutput =
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput
  | AttioCompanyOutput;

/* engagement */
export type OriginalEngagementOutput =
  | HubspotEngagementOutput
  | ZohoEngagementOutput
  | ZendeskEngagementOutput
  | PipedriveEngagementOutput;

/* note */
export type OriginalNoteOutput =
  | HubspotNoteOutput
  | ZohoNoteOutput
  | ZendeskNoteOutput
  | PipedriveNoteOutput;

/* task */
export type OriginalTaskOutput =
  | HubspotTaskOutput
  | ZohoTaskOutput
  | ZendeskTaskOutput
  | PipedriveTaskOutput;

/* stage */
export type OriginalStageOutput =
  | HubspotStageOutput
  | ZohoStageOutput
  | ZendeskStageOutput
  | PipedriveStageOutput;

/* engagementType */

/* user */
export type OriginalUserOutput =
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
  | OriginalUserOutput;
