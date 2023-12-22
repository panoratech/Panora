import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { ZendeskTicketInput, ZendeskTicketOutput } from './types';

//TODO

export function convertUnifiedTicketToZendesk(
  source: UnifiedTicketInput,
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): ZendeskTicketInput {
  return;
}

export function convertZendeskTicketToUnified(
  source: ZendeskTicketOutput | ZendeskTicketOutput[],
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): UnifiedTicketOutput | UnifiedTicketOutput[] {
  return;
}

function mapSingleZendeskTicketToUnified(
  contact: ZendeskTicketOutput,
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): UnifiedTicketOutput {
  return;
}
