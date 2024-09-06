import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { IUnification } from '@@core/utils/types/interface';
import { TicketingObjectInput } from '@@core/utils/types/original/original.ticketing';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';

@Injectable()
export class TicketingUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<TicketingUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('ticketing', this);
  }
  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
    connectionId,
  }: {
    sourceObject: T;
    targetType_: TicketingObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
    connectionId?: string;
  }): Promise<TicketingObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'ticketing',
      targetType_,
      providerName,
    );

    if (mapping) {
      return mapping.desunify(sourceObject, customFieldMappings, connectionId);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }

  async unify<T extends UnifySourceType | UnifySourceType[]>({
    sourceObject,
    targetType_,
    providerName,
    connectionId,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: TicketingObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'ticketing',
      targetType_,
      providerName,
    );

    if (mapping) {
      return mapping.unify(sourceObject, connectionId, customFieldMappings);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }
}
