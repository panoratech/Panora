import { CrmObject } from 'src/crm/@types';
import { desunifyHubspot } from './hubspot';
import { CrmObjectInput } from '../types';
import { desunifyPipedrive } from './pipedrive';
import { desunifyZoho } from './zoho';
import { desunifyZendesk } from './zendesk';
import { desunifyFreshsales } from './freshsales';

export async function desunifyCrm<T extends Record<string, any>>({
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
