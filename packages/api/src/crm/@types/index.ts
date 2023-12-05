import {
  mapToContact_Freshsales,
  mapToUnifiedContact_Freshsales,
} from '@contact/services/freshsales/mappers';
import {
  mapToContact_Hubspot,
  mapToUnifiedContact_Hubspot,
} from '@contact/services/hubspot/mappers';
import {
  mapToContact_Pipedrive,
  mapToUnifiedContact_Pipedrive,
} from '@contact/services/pipedrive/mappers';
import {
  mapToContact_Zendesk,
  mapToUnifiedContact_Zendesk,
} from '@contact/services/zendesk/mappers';
import {
  mapToContact_Zoho,
  mapToUnifiedContact_Zoho,
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
      unify: mapToUnifiedContact_Hubspot,
      desunify: mapToContact_Hubspot,
    },
    //[CrmObject.deal]: ,
    //[CrmObject.company]:,
  },
  pipedrive: {
    [CrmObject.contact]: {
      unify: mapToUnifiedContact_Pipedrive,
      desunify: mapToContact_Pipedrive,
    },
  },
  zoho: {
    [CrmObject.contact]: {
      unify: mapToUnifiedContact_Zoho,
      desunify: mapToContact_Zoho,
    },
  },
  zendesk: {
    [CrmObject.contact]: {
      unify: mapToUnifiedContact_Zendesk,
      desunify: mapToContact_Zendesk,
    },
  },
  freshsales: {
    [CrmObject.contact]: {
      unify: mapToUnifiedContact_Freshsales,
      desunify: mapToContact_Freshsales,
    },
  },
};

export class PassThroughRequestDto {
  method: 'GET' | 'POST';
  path: string;
  data?: Record<string, any> | Record<string, any>[];
  headers?: Record<string, string>;
}
export * from '../contact/services/freshsales/types';
export * from '../contact/services/zendesk/types';
export * from '../contact/services/hubspot/types';
export * from '../contact/services/zoho/types';
export * from '../contact/services/pipedrive/types';
