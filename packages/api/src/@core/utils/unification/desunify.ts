import { CrmObject } from 'src/crm/@types';
import { ProviderVertical, getProviderVertical } from '../providers';
import { desunifyCrm } from './crm';
import { DesunifyReturnType, TargetObject, Unified } from '../types';

/* to insert data

SaaS > [Panora] > 3rdParties

*/

export async function desunify<T extends Unified>({
  sourceObject,
  targetType,
  providerName,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
}): Promise<DesunifyReturnType> {
  switch (getProviderVertical(providerName)) {
    case ProviderVertical.CRM:
      const targetType_ = targetType as CrmObject;
      return desunifyCrm({ sourceObject, targetType_, providerName });
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
