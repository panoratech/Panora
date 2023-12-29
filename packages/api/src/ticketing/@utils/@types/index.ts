import { IAttachmentService } from '@ticketing/attachment/types';
import { ICommentService } from '@ticketing/comment/types';
import { commentUnificationMapping } from '@ticketing/comment/types/mappingsTypes';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { IContactService } from '@ticketing/contact/types';
import { ITicketService } from '@ticketing/ticket/types';
import { ticketUnificationMapping } from '@ticketing/ticket/types/mappingsTypes';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { IUserService } from '@ticketing/user/types';

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

export type ITicketingService =
  | ITicketService
  | ICommentService
  | IUserService
  | IAttachmentService
  | IContactService;

export * from '../../ticket/services/zendesk/types';
export * from '../../comment/services/zendesk/types';
export * from '../../user/services/zendesk/types';
export * from '../../contact/services/zendesk/types';
export * from '../../attachment/services/zendesk/types';
