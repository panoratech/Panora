import { AccountingObject } from '@accounting/@lib/@types';
import { CrmObject } from '@crm/@lib/@types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';
import { Injectable } from '@nestjs/common';
import { ConnectorCategory } from '@panora/shared';
import { TicketingObject } from '@ticketing/@lib/@types';
import { TargetObject, Unified, UnifyReturnType } from '../../utils/types';
import { DesunifyReturnType } from '../../utils/types/desunify.input';
import { UnifySourceType } from '../../utils/types/unify.output';
import { UnificationRegistry } from '../registries/unification.registry';
import { EcommerceObject } from '@ecommerce/@lib/@types';

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
    connectionId,
    customFieldMappings,
    extraParams,
  }: {
    sourceObject: T;
    targetType: TargetObject;
    providerName: string;
    vertical: string;
    connectionId: string; //needed because inside mappers we might need it alongside remote_id to fetch a unified model in db
    customFieldMappings: {
      slug: string;
      remote_id: string;
    }[];
    extraParams?: { [key: string]: any };
  }): Promise<UnifyReturnType> {
    try {
      if (sourceObject == null) return [];
      let targetType_: TargetObject;
      switch (vertical.toLowerCase()) {
        case ConnectorCategory.Ecommerce:
          targetType_ = targetType as EcommerceObject;
          const ecommerceRegistry = this.registry.getService('ecommerce');
          return ecommerceRegistry.unify({
            sourceObject,
            targetType_,
            providerName,
            connectionId,
            customFieldMappings,
            extraParams,
          });
        case ConnectorCategory.Crm:
          targetType_ = targetType as CrmObject;
          const crmRegistry = this.registry.getService('crm');
          return crmRegistry.unify({
            sourceObject,
            targetType_,
            providerName,
            connectionId,
            customFieldMappings,
            extraParams,
          });
        case ConnectorCategory.Accounting:
          targetType_ = targetType as AccountingObject;
          const accountingRegistry = this.registry.getService('accounting');
          return accountingRegistry.unify({
            sourceObject,
            targetType_,
            providerName,
            connectionId,
            customFieldMappings,
          });
        case ConnectorCategory.FileStorage:
          targetType_ = targetType as FileStorageObject;
          const filestorageRegistry = this.registry.getService('filestorage');
          return filestorageRegistry.unify({
            sourceObject,
            targetType_,
            providerName,
            connectionId,
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
            connectionId,
            customFieldMappings,
          });
        case ConnectorCategory.Ticketing:
          targetType_ = targetType as TicketingObject;
          const ticketingRegistry = this.registry.getService('ticketing');
          return ticketingRegistry.unify({
            sourceObject,
            targetType_,
            providerName,
            connectionId,
            customFieldMappings,
          });
      }
    } catch (error) {
      throw error;
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
    connectionId,
  }: {
    sourceObject: T;
    targetType: TargetObject;
    providerName: string;
    vertical: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
    connectionId?: string;
  }): Promise<DesunifyReturnType> {
    try {
      let targetType_: TargetObject;
      switch (vertical.toLowerCase()) {
        case ConnectorCategory.Ecommerce:
          targetType_ = targetType as EcommerceObject;
          const ecommerceRegistry = this.registry.getService('ecommerce');
          return ecommerceRegistry.desunify({
            sourceObject,
            targetType_,
            providerName,
            customFieldMappings,
          });
        case ConnectorCategory.Crm:
          targetType_ = targetType as CrmObject;
          const crmRegistry = this.registry.getService('crm');
          return crmRegistry.desunify({
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
        case ConnectorCategory.MarketingAutomation:
          targetType_ = targetType as MarketingAutomationObject;
          const marketingautomationRegistry = this.registry.getService(
            'marketingautomation',
          );
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
            connectionId,
          });
      }
    } catch (error) {
      throw error;
    }
  }
}
