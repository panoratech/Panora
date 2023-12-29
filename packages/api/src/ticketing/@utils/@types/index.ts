import { ICommentService } from '@ticketing/comment/types';
import { commentUnificationMapping } from '@ticketing/comment/types/mappingsTypes';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { ITicketService } from '@ticketing/ticket/types';
import { ticketUnificationMapping } from '@ticketing/ticket/types/mappingsTypes';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export enum TicketingObject {
  ticket = 'ticket',
  comment = 'comment',
  user = 'user',
  attachment = 'attachement',
  contact = 'contact',
}

export type UnifiedTicketing =
  | UnifiedTicketInput
  | UnifiedTicketOutput
  | UnifiedCommentInput
  | UnifiedCommentOutput;

export const unificationMapping = {
  [TicketingObject.ticket]: ticketUnificationMapping,
  [TicketingObject.comment]: commentUnificationMapping,
};

export type ITicketingService = ITicketService | ICommentService;

export * from '../../ticket/services/zendesk/types';
export * from '../../comment/services/zendesk/types';
