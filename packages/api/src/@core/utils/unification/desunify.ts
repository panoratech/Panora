import { CrmObject } from '@crm/@lib/@types';
import { TargetObject, Unified } from '../types';
import { desunifyCrm } from '@crm/@lib/@unification';
import { TicketingObject } from '@ticketing/@lib/@types';
import { desunifyTicketing } from '@ticketing/@lib/@unification';
import { DesunifyReturnType } from '../types/desunify.input';
import { ProviderVertical } from '@panora/shared';

/* to insert data

SaaS > [Panora] > 3rdParties

*/

export async function desunify<T extends Unified>({
  sourceObject,
  targetType,
  providerName,
  vertical,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType: TargetObject;
  providerName: string;
  vertical: string;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<DesunifyReturnType> {
  let targetType_;
  switch (vertical.toLowerCase()) {
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
  }
}
