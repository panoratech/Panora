import { CrmObject } from '@crm/@types';
import { desunifyHubspot, unifyHubspot } from './hubspot';
import {
  CrmObjectInput,
  Unified,
  UnifyReturnType,
  UnifySourceType,
} from '../../types';
import { desunifyPipedrive, unifyPipedrive } from './pipedrive';
import { desunifyZoho, unifyZoho } from './zoho';
import { desunifyZendesk, unifyZendesk } from './zendesk';
import { desunifyFreshsales, unifyFreshsales } from './freshsales';

export async function desunifyCrm<T extends Unified>({
  sourceObject,
  targetType_,
  providerName,
}: {
  sourceObject: T;
  targetType_: CrmObject;
  providerName: string;
}): Promise<CrmObjectInput> {
  switch (providerName) {
    case 'hubspot':
      return desunifyHubspot({ sourceObject, targetType_ });
    case 'pipedrive':
      return desunifyPipedrive({ sourceObject, targetType_ });
    case 'zoho':
      return desunifyZoho({ sourceObject, targetType_ });
    case 'zendesk':
      return desunifyZendesk({ sourceObject, targetType_ });
    case 'freshsales':
      return desunifyFreshsales({ sourceObject, targetType_ });
  }
  return;
}

export async function unifyCrm<T extends UnifySourceType | UnifySourceType[]>({
  sourceObject,
  targetType_,
  providerName,
}: {
  sourceObject: T;
  targetType_: CrmObject;
  providerName: string;
}): Promise<UnifyReturnType> {
  switch (providerName) {
    case 'hubspot':
      return unifyHubspot({ sourceObject, targetType_ });
    case 'pipedrive':
      return unifyPipedrive({ sourceObject, targetType_ });
    case 'zoho':
      return unifyZoho({ sourceObject, targetType_ });
    case 'zendesk':
      return unifyZendesk({ sourceObject, targetType_ });
    case 'freshsales':
      return unifyFreshsales({ sourceObject, targetType_ });
  }
  return;
}
