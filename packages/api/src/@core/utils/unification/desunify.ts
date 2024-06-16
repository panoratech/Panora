import { CrmObject } from '@crm/@lib/@types';
import { TargetObject, Unified } from '../types';
import { desunifyCrm } from '@crm/@lib/@unification';
import { TicketingObject } from '@ticketing/@lib/@types';
import { desunifyTicketing } from '@ticketing/@lib/@unification';
import { DesunifyReturnType } from '../types/desunify.input';
import { ConnectorCategory } from '@panora/shared';
import { desunifyFileStorage } from '@filestorage/@lib/@unification';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';
import { desunifyMarketingAutomation } from '@marketingautomation/@lib/@unification';
import { desunifyHris } from '@hris/@lib/@unification';
import { HrisObject } from '@hris/@lib/@types';
import { AccountingObject } from '@accounting/@lib/@types';
import { desunifyAccounting } from '@accounting/@lib/@unification';
import { AtsObject } from '@ats/@lib/@types';
import { desunifyAts } from '@ats/@lib/@unification';

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
    case ConnectorCategory.Crm:
      targetType_ = targetType as CrmObject;
      return desunifyCrm({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Ats:
      targetType_ = targetType as AtsObject;
      return desunifyAts({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Accounting:
      targetType_ = targetType as AccountingObject;
      return desunifyAccounting({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.FileStorage:
      targetType_ = targetType as FileStorageObject;
      return desunifyFileStorage({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Hris:
      targetType_ = targetType as HrisObject;
      return desunifyHris({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.MarketingAutomation:
      targetType_ = targetType as MarketingAutomationObject;
      return desunifyMarketingAutomation({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
    case ConnectorCategory.Ticketing:
      targetType_ = targetType as TicketingObject;
      return desunifyTicketing({
        sourceObject,
        targetType_,
        providerName,
        customFieldMappings,
      });
  }
}
