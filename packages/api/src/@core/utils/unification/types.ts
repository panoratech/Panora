import {
  CrmObject,
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from 'src/crm/@types';

import { HrisObject } from 'src/hris/@types';
import { AtsObject } from 'src/ats/@types';
import { AccountingObject } from 'src/accounting/@types';
import { MarketingAutomationObject } from 'src/marketing-automation/@types';
import { TicketingObject } from 'src/ticketing/@types';
import { FileStorageObject } from 'src/file-storage/@types';

// Actions TYPE
export type ContactInput =
  | FreshsalesContactInput
  | HubspotContactInput
  | ZohoContactInput
  | ZendeskContactInput
  | PipedriveContactInput;

export type DealInput = '';
export type CompaniesInput = '';

///////

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

///
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
