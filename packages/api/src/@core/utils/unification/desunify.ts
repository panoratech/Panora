import { CrmObject } from '@crm/@utils/@types';
import {
  ProviderVertical,
  TargetObject,
  Unified,
  getProviderVertical,
} from '../types';
import { desunifyCrm } from '@crm/@utils/@unification';
import { TicketingObject } from '@ticketing/@utils/@types';
import { desunifyTicketing } from '@ticketing/@utils/@unification';
import { DesunifyReturnType } from '../types/desunify.input';

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
  let targetType_;
  switch (getProviderVertical(providerName)) {
    case ProviderVertical.CRM:
      targetType_ = targetType as CrmObject;
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
      targetType_ = targetType as TicketingObject;
      return desunifyTicketing({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ProviderVertical.Unknown:
      break;
  }
}
