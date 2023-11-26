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
