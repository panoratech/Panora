import { IAccountMapper } from '@ticketing/account/types';
import { ZendeskAccountInput, ZendeskAccountOutput } from './types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class ZendeskAccountMapper implements IAccountMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'account',
      'zendesk',
      this,
    );
  }
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskAccountInput {
    return;
  }

  unify(
    source: ZendeskAccountOutput | ZendeskAccountOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleAccountToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return source.map((ticket) =>
      this.mapSingleAccountToUnified(ticket, connectionId, customFieldMappings),
    );
  }

  private mapSingleAccountToUnified(
    account: ZendeskAccountOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput {
    const unifiedAccount: UnifiedAccountOutput = {
      remote_id: String(account.id),
      name: account.name,
      domains: account.domain_names,
    };

    return unifiedAccount;
  }
}
