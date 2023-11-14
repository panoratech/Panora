import { CrmObject } from 'src/crm/@types';
import { ProviderVertical, getProviderVertical } from '../providers';
import { desunifyCrm } from './crm';
import { DesunifyReturnType, TargetObject } from './types';

/* to insert data

SaaS > [Panora] > 3rdParties > 

*/

export async function desunify<T extends Record<string, any>>({
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
  return;
}

// TODO
/* to fetch data

3rdParties > [Panora] > SaaS

*/
export async function unify<T extends Record<string, any>>({
  sourceObject,
  targetType,
  providerName,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
}): Promise<DesunifyReturnType> {
  return;
}
