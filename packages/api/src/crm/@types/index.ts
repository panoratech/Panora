import {
  convertUnifiedContactToFreshsales,
  convertFreshsalesContactToUnified,
} from '@contact/services/freshsales/mappers';
import {
  convertUnifiedContactToHubspot,
  convertHubspotContactToUnified,
} from '@contact/services/hubspot/mappers';
import {
  convertUnifiedContactToPipedrive,
  convertPipedriveContactToUnified,
} from '@contact/services/pipedrive/mappers';
import {
  convertUnifiedContactToZendesk,
  convertZendeskContactToUnified,
} from '@contact/services/zendesk/mappers';
import {
  convertUnifiedContactToZoho,
  convertZohoContactToUnified,
} from '@contact/services/zoho/mappers';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';
import { UnifiedDealInput } from '@deal/dto/create-deal.dto';

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

export const providerUnificationMapping = {
  hubspot: {
    [CrmObject.contact]: {
      unify: convertHubspotContactToUnified,
      desunify: convertUnifiedContactToHubspot,
    },
    //[CrmObject.deal]: ,
    //[CrmObject.company]:,
  },
  pipedrive: {
    [CrmObject.contact]: {
      unify: convertPipedriveContactToUnified,
      desunify: convertUnifiedContactToPipedrive,
    },
  },
  zoho: {
    [CrmObject.contact]: {
      unify: convertZohoContactToUnified,
      desunify: convertUnifiedContactToZoho,
    },
  },
  zendesk: {
    [CrmObject.contact]: {
      unify: convertZendeskContactToUnified,
      desunify: convertUnifiedContactToZendesk,
    },
  },
  freshsales: {
    [CrmObject.contact]: {
      unify: convertFreshsalesContactToUnified,
      desunify: convertUnifiedContactToFreshsales,
    },
  },
};

export * from '../contact/services/freshsales/types';
export * from '../contact/services/zendesk/types';
export * from '../contact/services/hubspot/types';
export * from '../contact/services/zoho/types';
export * from '../contact/services/pipedrive/types';
