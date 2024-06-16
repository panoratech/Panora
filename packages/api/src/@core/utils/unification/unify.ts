import { CrmObject } from '@crm/@lib/@types';
import { TargetObject, UnifyReturnType } from '../types';
import { unifyCrm } from '@crm/@lib/@unification';
import { TicketingObject } from '@ticketing/@lib/@types';
import { unifyTicketing } from '@ticketing/@lib/@unification';
import { UnifySourceType } from '../types/unify.output';
import { ConnectorCategory } from '@panora/shared';
import { unifyFileStorage } from '@filestorage/@lib/@unification';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { unifyMarketingAutomation } from '@marketingautomation/@lib/@unification';
import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';
import { HrisObject } from '@hris/@lib/@types';
import { unifyHris } from '@hris/@lib/@unification';
import { AccountingObject } from '@accounting/@lib/@types';
import { AtsObject } from '@ats/@lib/@types';
import { unifyAccounting } from '@accounting/@lib/@unification';

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
      targetType_ = targetType as AtsObject;
      return unifyFileStorage({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Accounting:
      targetType_ = targetType as AccountingObject;
      return unifyAccounting({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.FileStorage:
      targetType_ = targetType as FileStorageObject;
      return unifyFileStorage({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Hris:
      targetType_ = targetType as HrisObject;
      return unifyHris({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.MarketingAutomation:
      targetType_ = targetType as MarketingAutomationObject;
      return unifyMarketingAutomation({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Ticketing:
      targetType_ = targetType as TicketingObject;
      return unifyTicketing({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
  }
}
