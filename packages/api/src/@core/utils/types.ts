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
} from 'src/crm/@types';

import { HrisObject } from 'src/hris/@types';
import { AtsObject, UnifiedAts } from 'src/ats/@types';
import { AccountingObject } from 'src/accounting/@types';
import { MarketingAutomationObject } from 'src/marketing-automation/@types';
import { TicketingObject } from 'src/ticketing/@types';
import { FileStorageObject } from 'src/file-storage/@types';

export type Unified = UnifiedCrm | UnifiedAts;

// Actions TYPE
export type ContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;
export type ContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;
export type DealInput = '';
export type DealOutput = '';
export type CompaniesInput = '';
export type CompaniesOutput = '';

// Vertical Input Types
export type CrmObjectInput = ContactInput | DealInput | CompaniesInput;
export type TicketingObjectInput = ContactInput | DealInput | CompaniesInput;
export type AtsObjectInput = ContactInput | DealInput | CompaniesInput;
export type MarketingAutomationObjectInput =
  | ContactInput
  | DealInput
  | CompaniesInput;
export type AccountingObjectInput = ContactInput | DealInput | CompaniesInput;
export type FileStorageObjectInput = ContactInput | DealInput | CompaniesInput;
export type HrisObjectInput = ContactInput | DealInput | CompaniesInput;

// Vertical Output Types
export type CrmObjectOutput = ContactOutput | DealOutput | CompaniesOutput;
export type TicketingObjectOutput =
  | ContactOutput
  | DealOutput
  | CompaniesOutput;
export type AtsObjectOutput = ContactOutput | DealOutput | CompaniesOutput;
export type MarketingAutomationObjectOutput =
  | ContactOutput
  | DealOutput
  | CompaniesOutput;
export type AccountingObjectOutput =
  | ContactOutput
  | DealOutput
  | CompaniesOutput;
export type FileStorageObjectOutput =
  | ContactOutput
  | DealOutput
  | CompaniesOutput;
export type HrisObjectOutput = ContactOutput | DealOutput | CompaniesOutput;

//
export type TargetObject =
  | CrmObject
  | HrisObject
  | AtsObject
  | AccountingObject
  | FileStorageObject
  | MarketingAutomationObject
  | TicketingObject;

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
