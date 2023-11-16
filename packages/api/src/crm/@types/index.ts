import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '../contact/dto/create-contact.dto';
import { UnifiedDealInput } from '../deal/dto/create-deal.dto';

export enum CrmObject {
  company = 'company',
  contact = 'contact',
  deal = 'deal',
  event = 'event',
  lead = 'lead',
  note = 'note',
  task = 'task',
  user = 'user',
}

export type UnifiedCrm =
  | UnifiedContactInput
  | UnifiedContactOutput
  | UnifiedDealInput;

export * from './../contact/services/freshsales/types';
export * from './../contact/services/zendesk/types';
export * from './../contact/services/hubspot/types';
export * from './../contact/services/zoho/types';
export * from './../contact/services/pipedrive/types';
