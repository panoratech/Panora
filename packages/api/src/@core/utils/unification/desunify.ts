import { CrmObject } from '@crm/@types';
import { DesunifyReturnType, TargetObject, Unified } from '../types';
import { desunifyCrm } from '@crm/@unification';
import { ProviderVertical, getProviderVertical } from 'shared-types';

/* to insert data

SaaS > [Panora] > 3rdParties

*/

export async function desunify<T extends Unified>({
  sourceObject,
  targetType,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<DesunifyReturnType> {
  switch (getProviderVertical(providerName)) {
    case ProviderVertical.CRM:
      const targetType_ = targetType as CrmObject;
      return desunifyCrm({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ProviderVertical.ATS:
      break;
    case ProviderVertical.Accounting:
      break;
    case ProviderVertical.FileStorage:
      break;
    case ProviderVertical.HRIS:
      break;
    case ProviderVertical.MarketingAutomation:
      break;
    case ProviderVertical.Ticketing:
      break;
    case ProviderVertical.Unknown:
      break;
  }
}
