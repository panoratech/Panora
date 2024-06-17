import { CrmObject } from '@crm/@lib/@types';
import { TargetObject, Unified, UnifyReturnType } from '../types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { UnifySourceType } from '../types/unify.output';
import { ConnectorCategory } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';
import { HrisObject } from '@hris/@lib/@types';
import { AccountingObject } from '@accounting/@lib/@types';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable } from '@nestjs/common';
import { UnificationRegistry } from '../registry/unification.registry';
import { CrmUnificationService } from '@crm/@lib/@unification';
import { AtsUnificationService } from '@ats/@lib/@unification';
import { DesunifyReturnType } from '../types/desunify.input';
import { AccountingUnificationService } from '@accounting/@lib/@unification';
import { FileStorageUnificationService } from '@filestorage/@lib/@unification';
import { HrisUnificationService } from '@hris/@lib/@unification';
import { MarketingAutomationUnificationService } from '@marketingautomation/@lib/@unification';
import { TicketingUnificationService } from '@ticketing/@lib/@unification';

@Injectable()
export class CoreUnification {
  constructor(private registry: UnificationRegistry<any>) {}

  /* to fetch data

  3rdParties > [Panora] > SaaS

  */
  async unify<T extends UnifySourceType | UnifySourceType[]>({
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
    let targetType_: TargetObject;
    switch (vertical.toLowerCase()) {
      case ConnectorCategory.Crm:
        targetType_ = targetType as CrmObject;
        const crmRegistry = this.registry.getService('crm');
        return crmRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Ats:
        targetType_ = targetType as AtsObject;
        const atsRegistry = this.registry.getService('ats');
        return atsRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Accounting:
        targetType_ = targetType as AccountingObject;
        const accountingRegistry = this.registry.getService('accounting');

        return accountingRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.FileStorage:
        targetType_ = targetType as FileStorageObject;
        const filestorageRegistry = this.registry.getService('filestorage');

        return filestorageRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Hris:
        targetType_ = targetType as HrisObject;
        const hrisRegistry = this.registry.getService('hris');

        return hrisRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.MarketingAutomation:
        targetType_ = targetType as MarketingAutomationObject;
        const marketingautomationRegistry = this.registry.getService(
          'marketingautomation',
        );

        return marketingautomationRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Ticketing:
        targetType_ = targetType as TicketingObject;
        const ticketingRegistry = this.registry.getService('ticketing');

        return ticketingRegistry.unify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
    }
  }

  /* to insert data

  SaaS > [Panora] > 3rdParties

  */

  async desunify<T extends Unified>({
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
    let targetType_: TargetObject;
    switch (vertical.toLowerCase()) {
      case ConnectorCategory.Crm:
        targetType_ = targetType as CrmObject;
        const crmRegistry = this.registry.getService('crm');
        return crmRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Ats:
        targetType_ = targetType as AtsObject;
        const atsRegistry = this.registry.getService('ats');
        return atsRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Accounting:
        targetType_ = targetType as AccountingObject;
        const accountingRegistry = this.registry.getService('accounting');
        return accountingRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.FileStorage:
        targetType_ = targetType as FileStorageObject;
        const filestorageRegistry = this.registry.getService('filestorage');
        return filestorageRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Hris:
        targetType_ = targetType as HrisObject;
        const hrisRegistry = this.registry.getService('crm');
        return hrisRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.MarketingAutomation:
        targetType_ = targetType as MarketingAutomationObject;
        const marketingautomationRegistry =
          this.registry.getService('arketingautomation');
        return marketingautomationRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
      case ConnectorCategory.Ticketing:
        targetType_ = targetType as TicketingObject;
        const ticketingRegistry = this.registry.getService('ticketing');
        return ticketingRegistry.desunify({
          sourceObject,
          targetType_,
          providerName,
          customFieldMappings,
        });
    }
  }
}
