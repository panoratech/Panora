import { ITicketMapper } from '@ticketing/ticket/types';
import { ZendeskTicketInput, ZendeskTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

//TODO
export class ZendeskTicketMapper implements ITicketMapper {
  desunify(source: UnifiedTicketInput): ZendeskTicketInput {
    return;
  }

  unify(
    source: ZendeskTicketOutput | ZendeskTicketOutput[],
  ): UnifiedTicketOutput | UnifiedTicketOutput[] {
    return;
  }
}
