import { ITicketMapper } from '@ticketing/ticket/types';
import { GithubTicketInput, GithubTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export class GithubTicketMapper implements ITicketMapper {
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubTicketInput {
    return;
  }

  unify(
    source: GithubTicketOutput | GithubTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput | UnifiedTicketOutput[] {
    return;
  }
}
