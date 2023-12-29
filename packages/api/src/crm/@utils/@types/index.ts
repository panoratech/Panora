import { contactUnificationMapping } from '@crm/contact/types/mappingsTypes';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { UnifiedDealInput } from '@crm/deal/dto/create-deal.dto';

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

export const unificationMapping = {
  [CrmObject.contact]: contactUnificationMapping,
  [CrmObject.deal]: '',
};
export * from '../../contact/services/freshsales/types';
export * from '../../contact/services/zendesk/types';
export * from '../../contact/services/hubspot/types';
export * from '../../contact/services/zoho/types';
export * from '../../contact/services/pipedrive/types';
