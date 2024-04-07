import { IAccountMapper } from '@ticketing/account/types';
import { GithubAccountInput, GithubAccountOutput } from './types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';

export class GithubAccountMapper implements IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubAccountInput {
    return;
  }

  unify(
    source: GithubAccountOutput | GithubAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleAccountToUnified(source, customFieldMappings);
    }
    return source.map((ticket) =>
      this.mapSingleAccountToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleAccountToUnified(
    account: GithubAccountOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput {
    const unifiedAccount: UnifiedAccountOutput = {
      name: account.login,
      domains: [
        account.events_url,
        account.hooks_url,
        account.issues_url,
        account.members_url,
        account.public_members_url,
        account.repos_url,
      ],
    };
    return unifiedAccount;
  }
}
