import { AffinityUserInput, AffinityUserOutput } from '@crm/user/services/affinity/types';

import { AffinityNoteInput, AffinityNoteOutput } from '@crm/note/services/affinity/types';

import { AffinityDealInput, AffinityDealOutput } from '@crm/deal/services/affinity/types';

import { AffinityCompanyInput, AffinityCompanyOutput } from '@crm/company/services/affinity/types';

import { AffinityContactInput, AffinityContactOutput } from '@crm/contact/services/affinity/types';

import { AttioCompanyOutput } from '@crm/company/services/attio/types';
import { HubspotCompanyOutput } from '@crm/company/services/hubspot/types';
import { PipedriveCompanyOutput } from '@crm/company/services/pipedrive/types';
import { ZendeskCompanyOutput } from '@crm/company/services/zendesk/types';
import { ZohoCompanyOutput } from '@crm/company/services/zoho/types';
import { CloseCompanyOutput } from '@crm/company/services/close/types';
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
import {
  CloseContactInput,
  CloseContactOutput,
} from '@crm/contact/services/close/types';
import { HubspotDealOutput } from '@crm/deal/services/hubspot/types';
import { PipedriveDealOutput } from '@crm/deal/services/pipedrive/types';
import { ZendeskDealOutput } from '@crm/deal/services/zendesk/types';
import { ZohoDealOutput } from '@crm/deal/services/zoho/types';
import { CloseDealOutput } from '@crm/deal/services/close/types';
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
  CloseEngagementInput,
  CloseEngagementOutput,
} from '@crm/engagement/services/close/types';
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
  CloseNoteInput,
  CloseNoteOutput,
} from '@crm/note/services/close/types';
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
  CloseStageInput,
  CloseStageOutput,
} from '@crm/stage/services/close/types';
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
  CloseTaskInput,
  CloseTaskOutput,
} from '@crm/task/services/close/types';
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
  CloseUserInput,
  CloseUserOutput,
} from '@crm/user/services/close/types';
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
  | AffinityContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput
  | AttioContactInput
  | CloseContactInput;

/* deal */
export type OriginalDealInput =
  | AffinityDealInput
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput
  | CloseDealOutput;

/* company */
export type OriginalCompanyInput =
  | AffinityCompanyInput
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput
  | AttioCompanyOutput
  | CloseCompanyOutput;

/* engagement */
export type OriginalEngagementInput =
  | HubspotEngagementInput
  | ZohoEngagementInput
  | ZendeskEngagementInput
  | PipedriveEngagementInput
  | CloseEngagementInput;

/* note */
export type OriginalNoteInput =
  | AffinityNoteInput
  | HubspotNoteInput
  | ZohoNoteInput
  | ZendeskNoteInput
  | PipedriveNoteInput
  | CloseNoteInput;

/* task */
export type OriginalTaskInput =
  | HubspotTaskInput
  | ZohoTaskInput
  | ZendeskTaskInput
  | PipedriveTaskInput
  | CloseTaskInput;

/* stage */
export type OriginalStageInput =
  | HubspotStageInput
  | ZohoStageInput
  | ZendeskStageInput
  | PipedriveStageInput
  | CloseStageInput;

/* engagementType */

/* user */
export type OriginalUserInput =
  | AffinityUserInput
  | HubspotUserInput
  | ZohoUserInput
  | ZendeskUserInput
  | PipedriveUserInput
  | CloseUserOutput;

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
  | AffinityContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput
  | AttioContactOutput
  | CloseContactOutput;

/* deal */
export type OriginalDealOutput =
  | AffinityDealOutput
  | HubspotDealOutput
  | ZohoDealOutput
  | ZendeskDealOutput
  | PipedriveDealOutput
  | CloseDealOutput;

/* company */
export type OriginalCompanyOutput =
  | AffinityCompanyOutput
  | HubspotCompanyOutput
  | ZohoCompanyOutput
  | ZendeskCompanyOutput
  | PipedriveCompanyOutput
  | AttioCompanyOutput
  | CloseCompanyOutput;

/* engagement */
export type OriginalEngagementOutput =
  | HubspotEngagementOutput
  | ZohoEngagementOutput
  | ZendeskEngagementOutput
  | PipedriveEngagementOutput
  | CloseEngagementOutput;

/* note */
export type OriginalNoteOutput =
  | AffinityNoteOutput
  | HubspotNoteOutput
  | ZohoNoteOutput
  | ZendeskNoteOutput
  | PipedriveNoteOutput
  | CloseNoteOutput;

/* task */
export type OriginalTaskOutput =
  | HubspotTaskOutput
  | ZohoTaskOutput
  | ZendeskTaskOutput
  | PipedriveTaskOutput
  | CloseTaskOutput;

/* stage */
export type OriginalStageOutput =
  | HubspotStageOutput
  | ZohoStageOutput
  | ZendeskStageOutput
  | PipedriveStageOutput
  | CloseStageOutput;

/* engagementType */

/* user */
export type OriginalUserOutput =
  | AffinityUserOutput
  | HubspotUserOutput
  | ZohoUserOutput
  | ZendeskUserOutput
  | PipedriveUserOutput
  | CloseUserInput;

export type CrmObjectOutput =
  | OriginalContactOutput
  | OriginalDealOutput
  | OriginalCompanyOutput
  | OriginalEngagementOutput
  | OriginalNoteOutput
  | OriginalTaskOutput
  | OriginalStageOutput
  | OriginalUserOutput;
