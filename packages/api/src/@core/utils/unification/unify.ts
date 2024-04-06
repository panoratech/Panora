import { CrmObject } from '@crm/@utils/@types';
import { TargetObject, UnifyReturnType } from '../types';
import { unifyCrm } from '@crm/@utils/@unification';
import { TicketingObject } from '@ticketing/@utils/@types';
import { unifyTicketing } from '@ticketing/@utils/@unification';
import { UnifySourceType } from '../types/unify.output';
import { ProviderVertical } from '@panora/shared';

/* to fetch data

3rdParties > [Panora] > SaaS

*/

export async function unify<T extends UnifySourceType | UnifySourceType[]>({
  sourceObject,
  targetType,
  providerName,
  vertical,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
  vertical: string,
  customFieldMappings: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<UnifyReturnType> {
  if (sourceObject == null) return [];
  let targetType_;
  switch (vertical.toLowerCase()) {
    case ProviderVertical.CRM:
      targetType_ = targetType as CrmObject;
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
      targetType_ = targetType as TicketingObject;
      return unifyTicketing({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ProviderVertical.Unknown:
      break;
  }
  return;
}
