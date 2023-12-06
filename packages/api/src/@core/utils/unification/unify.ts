import { CrmObject } from '@crm/@types';
import { TargetObject, UnifyReturnType, UnifySourceType } from '../types';
import { unifyCrm } from '@crm/@unification';
import { ProviderVertical, getProviderVertical } from 'shared-types';

/* to fetch data

3rdParties > [Panora] > SaaS

*/

export async function unify<T extends UnifySourceType | UnifySourceType[]>({
  sourceObject,
  targetType,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
  customFieldMappings: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<UnifyReturnType> {
  if (sourceObject == null) return [];
  switch (getProviderVertical(providerName)) {
    case ProviderVertical.CRM:
      const targetType_ = targetType as CrmObject;
      return unifyCrm({
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
  return;
}
