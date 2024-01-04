import { IAccountService } from '@ticketing/account/types';
import { UnifiedAccountInput, UnifiedAccountOutput } from '@ticketing/account/types/model.unified';
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
import { userUnificationMapping } from '@ticketing/user/types/mappingsTypes';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';

export enum TicketingObject {
  ticket = 'ticket',
  comment = 'comment',
  user = 'user',
  attachment = 'attachement',
  contact = 'contact',
  account = 'account',
  tag = 'tag',
  team = 'team',
}

export type UnifiedTicketing =
  | UnifiedTicketInput
  | UnifiedTicketOutput
  | UnifiedCommentInput
  | UnifiedCommentOutput
  | UnifiedUserInput
  | UnifiedUserOutput
  | UnifiedAccountInput
  | UnifiedAccountOutput;
  | UnifiedContactInput
  | UnifiedContactOutput;
  | UnifiedTeamInput
  | UnifiedTeamOutput
  | UnifiedTagInput
  | UnifiedTagOutput
  | UnifiedAttachmentInput
  | UnifiedAttachmentOutput;

export const unificationMapping = {
  [TicketingObject.ticket]: ticketUnificationMapping,
  [TicketingObject.comment]: commentUnificationMapping,
  [TicketingObject.user]: userUnificationMapping,
  [TicketingObject.account]: accountUnificationMapping,
  [TicketingObject.contact]: contactUnificationMapping,
  [TicketingObject.team]: teamUnificationMapping,
  [TicketingObject.tag]: tagUnificationMapping,
  [TicketingObject.attachment]: attachmentUnificationMapping,
};

export type ITicketingService =
  | ITicketService
  | ICommentService
  | IUserService
  | IAttachmentService
  | IContactService
  | ITeamService
  | ITagService;
;

export * from '../../ticket/services/zendesk/types';
export * from '../../comment/services/zendesk/types';
export * from '../../user/services/zendesk/types';
export * from '../../contact/services/zendesk/types';
export * from '../../attachment/services/zendesk/types';
export * from '../../account/services/zendesk/types';
export * from '../../team/services/zendesk/types';
export * from '../../tag/services/zendesk/types';
