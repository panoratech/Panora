import { ticketUnificationMapping } from '@ticketing/ticket/types/mappingsTypes';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export enum TicketingObject {
  ticket = 'ticket',
}

export type UnifiedTicketing = UnifiedTicketInput | UnifiedTicketOutput;

export const unificationMapping = {
  [TicketingObject.ticket]: ticketUnificationMapping,
};

export * from '../../ticket/services/zendesk/types';
