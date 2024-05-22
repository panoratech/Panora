import { CrmObject } from '@crm/@lib/@types';
import { TargetObject, UnifyReturnType } from '../types';
import { unifyCrm } from '@crm/@lib/@unification';
import { TicketingObject } from '@ticketing/@lib/@types';
import { unifyTicketing } from '@ticketing/@lib/@unification';
import { UnifySourceType } from '../types/unify.output';
import { ConnectorCategory } from '@panora/shared';

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
  vertical: string;
  customFieldMappings: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<UnifyReturnType> {
  if (sourceObject == null) return [];
  let targetType_;
  switch (vertical.toLowerCase()) {
    case ConnectorCategory.Crm:
      targetType_ = targetType as CrmObject;
      return unifyCrm({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Ats:
      break;
    case ConnectorCategory.Accounting:
      break;
    case ConnectorCategory.FileStorage:
      break;
    case ConnectorCategory.Hris:
      break;
    case ConnectorCategory.MarketingAutomation:
      break;
    case ConnectorCategory.Ticketing:
      targetType_ = targetType as TicketingObject;
      return unifyTicketing({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
  }
  return;
}
